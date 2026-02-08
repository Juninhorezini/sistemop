# Integração Google Sheets - Documentação Técnica

## 📋 Estrutura da Planilha

### Aba: "OPs Produção"
Colunas necessárias:

| Coluna | Campo | Tipo | Descrição |
|--------|-------|------|-----------|
| A | Número | Integer | Número sequencial da OP |
| B | Data | Date | Data de criação (YYYY-MM-DD) |
| C | Itens | String | Itens concatenados (separados por vírgula) |
| D | Qtd Cones | Integer | Total de cones na OP |
| E | Qtd Rocas | Integer | Total de rocas calculado |
| F | Peso Total | Decimal | Peso total em kg |
| G | Data Envio | DateTime | Timestamp de quando foi enviado |

### Exemplo de Dados
```
Número | Data       | Itens           | Qtd Cones | Qtd Rocas | Peso Total | Data Envio
1      | 2024-02-08 | Item A, Item B  | 100       | 25        | 250.00     | 2024-02-08T10:30:00Z
2      | 2024-02-09 | Item A          | 50        | 13        | 130.00     | 2024-02-09T14:15:00Z
```

## 🔐 Configuração Google Apps Script

O Google Apps Script atua como intermediário entre o app e a planilha.

### Passo 1: Criar o Script
1. Abra a planilha em Google Sheets
2. Clique em **Extensões** > **Apps Script**
3. Limpe o código padrão e cole:

```javascript
// Configuração
const SHEET_NAME = 'OPs Produção';
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * Função principal para receber POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return respondWithError('Sheet "' + SHEET_NAME + '" não encontrada');
    }
    
    switch(action) {
      case 'saveOP':
        return saveOP(sheet, data.op);
      case 'getAllOPs':
        return getAllOPs(sheet);
      case 'getLastOPNumber':
        return getLastOPNumber(sheet);
      case 'updateOP':
        return updateOP(sheet, data.op);
      case 'deleteOP':
        return deleteOP(sheet, data.opNumber);
      default:
        return respondWithError('Ação inválida: ' + action);
    }
  } catch(error) {
    Logger.log('Erro em doPost: ' + error.toString());
    return respondWithError(error.toString());
  }
}

/**
 * Salva uma nova OP
 */
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
      return respondWithError('Número de OP ' + op.numero + ' já existe');
    }
    
    // Adiciona linha
    const row = [
      op.numero,
      op.data,
      itemNomes,
      totalCones,
      totalRocas,
      parseFloat(totalPeso.toFixed(2)),
      new Date().toISOString()
    ];
    
    sheet.appendRow(row);
    
    return respond(true, {
      numero: op.numero,
      mensagem: 'OP salva com sucesso'
    });
  } catch(error) {
    return respondWithError('Erro ao salvar OP: ' + error.toString());
  }
}

/**
 * Retorna todas as OPs
 */
function getAllOPs(sheet) {
  try {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const ops = rows.map(row => {
      return {
        numero: row[0],
        data: row[1],
        itens: row[2],
        qtdCones: row[3],
        qtdRocas: row[4],
        pesoTotal: row[5],
        dataEnvio: row[6]
      };
    });
    
    return respond(true, { ops: ops, count: ops.length });
  } catch(error) {
    return respondWithError('Erro ao buscar OPs: ' + error.toString());
  }
}

/**
 * Retorna o último número de OP
 */
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
  } catch(error) {
    return respondWithError('Erro ao buscar último número: ' + error.toString());
  }
}

/**
 * Atualiza uma OP existente
 */
function updateOP(sheet, op) {
  try {
    const data = sheet.getDataRange().getValues();
    const rowIndex = findRowByOPNumber(data, op.numero);
    
    if (rowIndex === -1) {
      return respondWithError('OP ' + op.numero + ' não encontrada');
    }
    
    const totalCones = op.itens.reduce((sum, i) => sum + i.qtdCones, 0);
    const totalRocas = op.itens.reduce((sum, i) => sum + i.qtdRocas, 0);
    const totalPeso = op.itens.reduce((sum, i) => sum + i.pesoTotal, 0);
    const itemNomes = op.itens.map(i => i.itemName).join(', ');
    
    const updateRow = rowIndex + 1; // Ajusta para 1-indexed
    
    sheet.getRange(updateRow, 1).setValue(op.numero);
    sheet.getRange(updateRow, 2).setValue(op.data);
    sheet.getRange(updateRow, 3).setValue(itemNomes);
    sheet.getRange(updateRow, 4).setValue(totalCones);
    sheet.getRange(updateRow, 5).setValue(totalRocas);
    sheet.getRange(updateRow, 6).setValue(parseFloat(totalPeso.toFixed(2)));
    sheet.getRange(updateRow, 7).setValue(new Date().toISOString());
    
    return respond(true, { numero: op.numero, mensagem: 'OP atualizada com sucesso' });
  } catch(error) {
    return respondWithError('Erro ao atualizar OP: ' + error.toString());
  }
}

/**
 * Deleta uma OP
 */
function deleteOP(sheet, opNumber) {
  try {
    const data = sheet.getDataRange().getValues();
    const rowIndex = findRowByOPNumber(data, opNumber);
    
    if (rowIndex === -1) {
      return respondWithError('OP ' + opNumber + ' não encontrada');
    }
    
    sheet.deleteRow(rowIndex + 1); // Ajusta para 1-indexed
    
    return respond(true, { mensagem: 'OP deletada com sucesso' });
  } catch(error) {
    return respondWithError('Erro ao deletar OP: ' + error.toString());
  }
}

/**
 * Funções auxiliares
 */
function findOPByNumber(sheet, opNumber) {
  const data = sheet.getDataRange().getValues();
  const rowIndex = findRowByOPNumber(data, opNumber);
  return rowIndex !== -1 ? data[rowIndex] : null;
}

function findRowByOPNumber(data, opNumber) {
  for (let i = 1; i < data.length; i++) {
    if (parseInt(data[i][0]) === opNumber) {
      return i;
    }
  }
  return -1;
}

function respondWithError(error) {
  return respond(false, { error: error });
}

function respond(success, data) {
  const response = {
    success: success,
    ...data
  };
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Passo 2: Implantar como Aplicação Web
1. Clique em **Implantar** > **Nova implantação**
2. Tipo: **Aplicação web**
3. Executar como: Sua conta Google
4. Quem tem acesso: **Qualquer pessoa**
5. Clique em **Implantar**
6. Copie a URL da aplicação web

### Passo 3: Configurar a URL no App
1. Crie arquivo `.env.local` na raiz do projeto:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy
```

## 🔄 Fluxo de Dados

### Salvando uma OP
```
App (React)
  ↓ POST request
Google Apps Script
  ↓
Google Sheets (Aba: OPs Produção)
  ↓ Response
App (sucesso/erro)
```

### Payload de Exemplo
```json
{
  "action": "saveOP",
  "sheetName": "OPs Produção",
  "op": {
    "numero": 123,
    "data": "2024-02-08",
    "itens": [
      {
        "itemId": 1,
        "itemName": "Item A",
        "qtdCones": 50,
        "qtdRocas": 13,
        "pesoTotal": 130.00,
        "pesoCone": 2.5,
        "pesoRoca": 10.0
      }
    ]
  }
}
```

## ⚠️ Limitações e Considerações

1. **Rate Limiting**: Google Sheets permite ~100 requisições/min
2. **Timeout**: Requisições devem completar em < 6 minutos
3. **Tamanho**: Máximo 10MB por requisição
4. **Segurança**: O script é público, qualquer um com a URL pode chamar
   - Implemente autenticação adicional se necessário

## 🛡️ Melhorias de Segurança (Opcional)

```javascript
// Adicione um token de autenticação
const VALID_TOKENS = ['seu-token-secreto-aqui'];

function doPost(e) {
  const token = e.parameter.token;
  
  if (!VALID_TOKENS.includes(token)) {
    return respondWithError('Não autorizado');
  }
  
  // ... resto do código
}
```

## 📞 Troubleshooting

### Erro 403 - Forbidden
- Verifique se a URL está correta
- Reimplante o script como "Qualquer pessoa"

### Erro 404 - Not Found
- O script ID pode ter mudado
- Reimplante e copie a URL novamente

### Dados não aparecem na planilha
- Verifique se o nome da aba está exatamente como "OPs Produção"
- Verifique as permissões de acesso à planilha

---

Para mais informações, consulte [Google Sheets API Docs](https://developers.google.com/sheets/api)
