# Integração Google Sheets - Documentação Técnica

## 📋 Estrutura da Planilha

### Aba: "OPs Produção"
Colunas necessárias:

| Coluna | Campo | Tipo | Descrição |
|--------|-------|------|-----------|
| A | Número | Integer | Número sequencial da OP |
| B | Data | Date | Data de criação (YYYY-MM-DD) |
| C | Cor | String | Cor da OP |
| D | Itens | String | Itens concatenados (separados por vírgula) |
| E | Qtd Cones | Integer | Total de cones na OP |
| F | Qtd Rocas | Integer | Total de rocas calculado |
| G | Peso Total | Decimal | Peso total em kg |
| H | Data Envio | DateTime | Timestamp de quando foi enviado |

### Exemplo de Dados
```
Número | Data       | Cor    | Itens           | Qtd Cones | Qtd Rocas | Peso Total | Data Envio
1      | 2024-02-08 | Azul   | Item A, Item B  | 100       | 25        | 250.00     | 2024-02-08T10:30:00Z
2      | 2024-02-09 | Verde  | Item A          | 50        | 13        | 130.00     | 2024-02-09T14:15:00Z
```

## 🔐 Configuração Google Apps Script (Standalone)

O Google Apps Script atua como intermediário independente entre o app e a planilha. Este é um projeto **standalone** que não depende de estar vinculado à planilha, reduzindo a carga de execução direta.

### Passo 1: Criar um Novo Projeto Standalone
1. Acesse [script.google.com](https://script.google.com)
2. Clique em **Novo projeto**
3. Nomeie como "SistemaOP - API"
4. Limpe o código padrão e cole:

```javascript
// Configuração para projeto standalone
const SHEET_NAME = 'OPs Produção';
const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI'; // ID da sua planilha

/**
 * Função principal para receber POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return respondWithError('Sheet "' + SHEET_NAME + '" não encontrada na planilha');
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
      op.color || '',
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
        color: row[2],
        itens: row[3],
        qtdCones: row[4],
        qtdRocas: row[5],
        pesoTotal: row[6],
        dataEnvio: row[7]
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
    sheet.getRange(updateRow, 3).setValue(op.color || '');
    sheet.getRange(updateRow, 4).setValue(itemNomes);
    sheet.getRange(updateRow, 5).setValue(totalCones);
    sheet.getRange(updateRow, 6).setValue(totalRocas);
    sheet.getRange(updateRow, 7).setValue(parseFloat(totalPeso.toFixed(2)));
    sheet.getRange(updateRow, 8).setValue(new Date().toISOString());
    
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

### Passo 2: Obter o ID da Planilha
1. Abra sua planilha em Google Sheets
2. Na URL, copie o ID entre `/d/` e `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/1mZ9_j3kL4qP2nR7sT5jH6fK/edit
   ```
   O ID é: `1mZ9_j3kL4qP2nR7sT5jH6fK`
3. Volte para o projeto Apps Script e substitua `SEU_SPREADSHEET_ID_AQUI` pelo ID obtido

### Passo 3: Conceder Permissões ao Script
1. No projeto Apps Script, clique em **Configurações** (engrenagem)
2. Anote o **ID do projeto**
3. Acesse sua planilha no Google Sheets
4. Clique em **Compartilhar** (canto superior direito)
5. Compartilhe a planilha com o e-mail associado ao projeto Apps Script
   - Você pode encontrar o e-mail em **Detalhes do projeto** no Apps Script

### Passo 4: Implantar como Aplicação Web
1. No Apps Script, clique em **Implantar** > **Nova implantação**
2. Tipo: **Aplicação web**
3. **Executar como**: Sua conta Google (a mesma com acesso à planilha)
4. **Quem tem acesso**: **Qualquer pessoa**
5. Clique em **Implantar**
6. **Copie a URL** da aplicação web gerada
7. Clique em "Liberar acesso" se solicitado

### Passo 5: Configurar a URL no App
1. Crie arquivo `.env.local` na raiz do projeto:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy
```

_Obs: Você copiou essa URL no Passo 4_

## 🔄 Fluxo de Dados

### Salvando uma OP
```
App (React)
  ↓ POST request (via URL standalone)
Google Apps Script (Projeto Independente)
  ↓
Google Sheets (Aba: OPs Produção)
  ↓ Response
App (sucesso/erro)
```

### Arquitetura
- **Planilha**: Armazena apenas dados, sem scripts vinculados ✓ _carga leve_
- **Apps Script Standalone**: Executa toda a lógica de negócio ✓ _escalável_
- **App React**: UI intuitiva ✓ _responsivo_

## ⚡ Atualizar Versão do Deployment
Sempre que você modificar o código do Apps Script:

1. Clique em **Implantar** > **Gerencie implantações**
2. Clique no ícone de editar (lápis) na implantação atual
3. Selecione **Criar nova versão**
4. Clique em **Implantar**

A URL permanece a mesma, mas o código é atualizado.

### Payload de Exemplo
```json
{
  "action": "saveOP",
  "sheetName": "OPs Produção",
  "op": {
    "numero": 123,
    "data": "2024-02-08",
    "color": "Azul",
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

1. **Rate Limiting**: Google Apps Script permite ~100 requisições/min
2. **Timeout**: Requisições devem completar em < 6 minutos
3. **Tamanho**: Máximo 10MB por requisição

## 📞 Troubleshooting

### Erro 403 - Forbidden / Unauthorized
- Verifique se a URL está correta
- Verifique se o SPREADSHEET_ID está correto
- Certifique-se de que compartilhou a planilha com sua conta Google

### Erro 404 - Not Found
- Reimplante o script
- Copie a URL novamente
- Verifique se o URL está correto no `.env.local`

### Dados não aparecem na planilha
- Verifique se o nome da aba está exatamente como **"OPs Produção"** (respeitando maiúsculas)
- Verifique as permissões de acesso à planilha
- Verifique o histórico de execução no Apps Script (Execuções)

### Erro: Sheet não encontrada
- Quando cria uma nova aba, certifique-se que o nome é exatamente **"OPs Produção"**
- Importante: Respeitar maiúsculas/minúsculas

---

Para mais informações, consulte [Google Apps Script Docs](https://developers.google.com/apps-script/)
