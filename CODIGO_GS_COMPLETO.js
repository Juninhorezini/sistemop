// ============================================================================
// SISTEMA OP - Google Apps Script Standalone
// Copie TODO este código e cole em Código.gs no Google Apps Script
// ============================================================================

// Configuração da planilha
const SHEET_NAME = 'OPs Produção';
const SPREADSHEET_ID = '1CWw8zKMf1ww08gynis7qIAYFjaYJo3PYb8bghp35zYE'; // ID corrigido conforme URL da planilha

// ============================================================================
// HANDLER HTTP: GET (Health Check)
// ============================================================================
function doGet(e) {
  try {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Health OK - Apps Script está funcionando',
      timestamp: new Date().toISOString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Erro em doGet: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// HANDLER HTTP: OPTIONS (CORS Preflight - NÃO SUPORTADO MAS MANTIDO PARA DEBUG)
// ============================================================================
function doOptions(e) {
  // Google Apps Script não suporta setHeader. 
  // O CORS é tratado automaticamente pelo Google se o retorno for JSON válido e não houver erro de runtime.
  return ContentService.createTextOutput('');
}

// ============================================================================
// HANDLER HTTP: POST (Main Router)
// ============================================================================
function doPost(e) {
  try {
    // Debug logging
    Logger.log('doPost chamado');
    Logger.log('Conteúdo recebido: ' + (e && e.postData ? e.postData.contents : 'nenhum'));
    
    // Valida entrada
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('Erro: Nenhum dado POST recebido');
      return respond(false, { error: 'Nenhum dado POST recebido' });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      Logger.log('Erro ao parsear JSON: ' + parseErr.toString());
      return respond(false, { error: 'JSON inválido: ' + parseErr.toString() });
    }

    const action = data.action;
    Logger.log('Ação solicitada: ' + action);

    // Valida planilha
    let spreadsheet;
    let sheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      sheet = spreadsheet.getSheetByName(SHEET_NAME);
    } catch (sheetErr) {
      Logger.log('Erro ao acessar planilha/sheet: ' + sheetErr.toString());
      Logger.log('SPREADSHEET_ID: ' + SPREADSHEET_ID);
      Logger.log('SHEET_NAME: ' + SHEET_NAME);
      return respond(false, { error: 'Erro ao acessar planilha: ' + sheetErr.toString() });
    }

    if (!sheet) {
      Logger.log('Sheet não encontrada: ' + SHEET_NAME);
      return respond(false, { error: 'Sheet "' + SHEET_NAME + '" não encontrada na planilha' });
    }

    // Router de ações
    switch (action) {
      case 'saveOP':
        return saveOP(sheet, data.op);
      case 'saveOPsBatch':
        return saveOPsBatch(sheet, data.ops);
      case 'getAllOPs':
        return getAllOPs(sheet);
      case 'getLastOPNumber':
        return getLastOPNumber(sheet);
      case 'updateOP':
        return updateOP(sheet, data.op);
      case 'deleteOP':
        return deleteOP(sheet, data.opNumber);
      default:
        Logger.log('Ação inválida: ' + action);
        return respond(false, { error: 'Ação inválida: ' + action });
    }
  } catch (error) {
    Logger.log('Erro em doPost: ' + error.toString());
    return respond(false, { error: 'Erro no servidor: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Salvar OPs em Lote (Batch)
// ============================================================================
function saveOPsBatch(sheet, ops) {
  try {
    if (!ops || !Array.isArray(ops) || ops.length === 0) {
      return respond(false, { error: 'Nenhuma OP fornecida para salvar' });
    }

    // Busca dados existentes para evitar duplicidade
    // Otimização: Lê todos os IDs de uma vez para memória
    const existingData = sheet.getDataRange().getValues();
    const existingIds = new Set();
    
    // Pula header (i=1) e pega coluna 0 (IDs)
    for (let i = 1; i < existingData.length; i++) {
      const id = parseInt(existingData[i][0]);
      if (!isNaN(id)) existingIds.add(id);
    }

    const rowsToAdd = [];
    const skippedOps = [];

    for (const op of ops) {
      // Verifica duplicidade
      if (existingIds.has(op.numero)) {
        skippedOps.push(op.numero);
        continue;
      }

      // Calcula totais
      const totalCones = op.itens.reduce((sum, i) => sum + i.qtdCones, 0);
      const totalRocas = op.itens.reduce((sum, i) => sum + i.qtdRocas, 0);
      const totalPeso = op.itens.reduce((sum, i) => sum + i.pesoTotal, 0);
      const itemNomes = op.itens.map(i => i.itemName).join(', ');

      // Monta linha
      const row = [
        op.numero,
        formatDate(op.data),
        itemNomes,
        op.color || '',
        totalCones,
        totalRocas,
        parseFloat(totalPeso.toFixed(2)),
        op.obs || '', // Observações
        formatDateTime(new Date())
      ];
      
      rowsToAdd.push(row);
      // Adiciona ao set local para evitar duplicidade dentro do próprio batch
      existingIds.add(op.numero);
    }

    // Salva em lote (Bulk Write) - Muito mais rápido que appendRow loopado
    if (rowsToAdd.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return respond(true, {
      mensagem: 'Processamento em lote concluído',
      salvos: rowsToAdd.length,
      ignorados: skippedOps.length,
      ignoradosIds: skippedOps
    });

  } catch (error) {
    return respond(false, { error: 'Erro ao salvar lote de OPs: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Salvar OP
// ============================================================================
function saveOP(sheet, op) {
  try {
    // Calcula totais
    const totalCones = op.itens.reduce((sum, i) => sum + i.qtdCones, 0);
    const totalRocas = op.itens.reduce((sum, i) => sum + i.qtdRocas, 0);
    const totalPeso = op.itens.reduce((sum, i) => sum + i.pesoTotal, 0);
    const itemNomes = op.itens.map(i => i.itemName).join(', ');

    // Verifica duplicidade de ID
    const existingOP = findOPByNumber(sheet, op.numero);
    if (existingOP) {
      return respond(false, { error: 'Número de OP ' + op.numero + ' já existe' });
    }

    // Adiciona linha
    const row = [
      op.numero,
      formatDate(op.data),
      itemNomes,
      op.color || '',
      totalCones,
      totalRocas,
      parseFloat(totalPeso.toFixed(2)),
      op.obs || '', // Observações
      formatDateTime(new Date())
    ];

    sheet.appendRow(row);

    return respond(true, {
      numero: op.numero,
      mensagem: 'OP salva com sucesso'
    });
  } catch (error) {
    return respond(false, { error: 'Erro ao salvar OP: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Buscar todas as OPs
// ============================================================================
function getAllOPs(sheet) {
  try {
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1); // Remove header

    const ops = rows.map(row => {
      return {
        numero: row[0],
        data: row[1],
        itens: row[2],
        color: row[3],
        qtdCones: row[4],
        qtdRocas: row[5],
        pesoTotal: row[6],
        obs: row[7], // Observações
        dataEnvio: row[8]
      };
    });

    return respond(true, { ops: ops, count: ops.length });
  } catch (error) {
    return respond(false, { error: 'Erro ao buscar OPs: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Buscar último número de OP
// ============================================================================
function getLastOPNumber(sheet) {
  try {
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return respond(true, { lastNumber: 0 });
    }

    // Remove header e extrai números
    const numbers = data.slice(1)
      .map(row => parseInt(row[0]))
      .filter(n => !isNaN(n) && n > 0);

    const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0;

    return respond(true, { lastNumber: lastNumber });
  } catch (error) {
    return respond(false, { error: 'Erro ao buscar último número: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Atualizar OP
// ============================================================================
function updateOP(sheet, op) {
  try {
    const data = sheet.getDataRange().getValues();
    const rowIndex = findRowByOPNumber(data, op.numero);

    if (rowIndex === -1) {
      return respond(false, { error: 'OP ' + op.numero + ' não encontrada' });
    }

    const totalCones = op.itens.reduce((sum, i) => sum + i.qtdCones, 0);
    const totalRocas = op.itens.reduce((sum, i) => sum + i.qtdRocas, 0);
    const totalPeso = op.itens.reduce((sum, i) => sum + i.pesoTotal, 0);
    const itemNomes = op.itens.map(i => i.itemName).join(', ');

    const updateRow = rowIndex + 1; // Ajusta para 1-indexed

    sheet.getRange(updateRow, 1).setValue(op.numero);
    sheet.getRange(updateRow, 2).setValue(op.data);
    sheet.getRange(updateRow, 3).setValue(op.color || '');
    sheet.getRange(updateRow, 4).setValue(itemNomes);
    sheet.getRange(updateRow, 5).setValue(totalCones);
    sheet.getRange(updateRow, 6).setValue(totalRocas);
    sheet.getRange(updateRow, 7).setValue(parseFloat(totalPeso.toFixed(2)));
    sheet.getRange(updateRow, 8).setValue(new Date().toISOString());

    return respond(true, { numero: op.numero, mensagem: 'OP atualizada com sucesso' });
  } catch (error) {
    return respond(false, { error: 'Erro ao atualizar OP: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÃO: Deletar OP
// ============================================================================
function deleteOP(sheet, opNumber) {
  try {
    const data = sheet.getDataRange().getValues();
    const rowIndex = findRowByOPNumber(data, opNumber);

    if (rowIndex === -1) {
      return respond(false, { error: 'OP ' + opNumber + ' não encontrada' });
    }

    sheet.deleteRow(rowIndex + 1); // Ajusta para 1-indexed

    return respond(true, { mensagem: 'OP deletada com sucesso' });
  } catch (error) {
    return respond(false, { error: 'Erro ao deletar OP: ' + error.toString() });
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Busca OP pelo número na planilha
 */
function findOPByNumber(sheet, opNumber) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = findRowByOPNumber(data, opNumber);
  return rowIndex !== -1 ? data[rowIndex] : null;
}

/**
 * Encontra índice da linha com dado número de OP
 */
function findRowByOPNumber(data, opNumber) {
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === opNumber) {
      return i;
    }
  }
  return -1;
}

/**
 * Wrapper para resposta JSON
 */
function respond(success, data) {
  const response = {
    success: success,
    ...data,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// HELPERS DE FORMATAÇÃO DE DATA
// ============================================================================

/**
 * Formata data YYYY-MM-DD para DD/MM/AAAA
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    // Se já vier formatado, retorna
    if (dateString.indexOf('/') !== -1) return dateString;
    
    // Assume input YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    return dateString;
  } catch (e) {
    return dateString;
  }
}

/**
 * Formata data/hora para DD/MM/AAAA HH:MM:SS (Fuso Horário Brasil -3)
 */
function formatDateTime(dateObj) {
  if (!dateObj) return '';
  try {
    return Utilities.formatDate(dateObj, "GMT-3", "dd/MM/yyyy HH:mm:ss");
  } catch (e) {
    return dateObj.toString();
  }
}

// ============================================================================
// FIM DO CÓDIGO
// ============================================================================
