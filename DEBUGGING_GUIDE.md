# Diagrama de Fluxo & Debugging

## 📊 Fluxo de Requisição Completo

```
USUÁRIO CLICA "SALVAR OP"
    │
    ↓
┌─────────────────────────────────────────────────────┐
│ React Component (GeradorOPTab.jsx)                  │
│ - Coleta dados do formulário                        │
│ - Valida inputs                                     │
│ - Chama googleSheetsService.saveOP(opData)         │
└────────────┬────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────┐
│ googleSheetsService.js                              │
│ - _getAuthorizedUrl() → cria URL com token         │
│ - POST para: URL + ?token=TOKEN                    │
│ - Body: { action: 'saveOP', op: {...} }           │
└────────────┬────────────────────────────────────────┘
             │
             ↓ (HTTP POST)
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
INTERNET         (Network latency: ~500ms-2s)
    │                 │
    └────────┬────────┘
             │
             ↓
┌─────────────────────────────────────────────────────┐
│ Google Apps Script Standalone (Projeto)             │
│                                                     │
│ doPost(e)                                          │
│  ├─ Extrai parâmetros                             │
│  ├─ Valida token (e.parameter.token)              │
│  ├─ Parse JSON (e.postData.contents)              │
│  └─ Chama action correspondente                   │
│                                                     │
│ saveOP(sheet, op)                                  │
│  ├─ Calcula totais (cones, rocas, peso)           │
│  ├─ Valida duplicidade                            │
│  ├─ sheet.appendRow([...])                        │
│  └─ Retorna resposta                              │
└────────────┬────────────────────────────────────────┘
             │
             ↓ (HTTP Response)
             │
┌─────────────────────────────────────────────────────┐
│ googleSheetsService.js                              │
│ - Recebe response JSON                              │
│ - Valida response.data.success                      │
│ - Retorna dados processados                         │
└────────────┬────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────┐
│ React Component (GeradorOPTab.jsx)                  │
│ - Recebe resultado                                  │
│ - Atualiza UI                                       │
│ - Exibe mensagem de sucesso/erro                    │
│ - Refresha lista de OPs (getAllOPs)                │
└────────────┬────────────────────────────────────────┘
             │
             ↓
USUÁRIO VÊ CONFIRMAÇÃO
```

---

## 🔄 Fluxo de Erro

```
ERRO EM QUALQUER PARTE DO FLUXO
    │
    ↓
┌──────────────────────────────┐
│ Gerenciamento de Erro        │
└──────────────────────────────┘
    │
    ├─ [Frontend] Try/Catch → googleSheetsService
    │
    ├─ [Service] Catch → axios.post()
    │  └─ console.error + throw Error
    │
    ├─ [Backend] Try/Catch → doPost()
    │  └─ respondWithError() → JSON { success: false, error: "..." }
    │
    ├─ [Service] Validar response.data.success
    │  └─ Não → throw Error(response.data.error)
    │
    ├─ [Component] Try/Catch → catch block
    │  └─ Exibir erro ao usuário
    │  └─ Log no console
    │
    └─ [Histórico] Google Apps Script > Execuções
       └─ Ver erro detalhado (timestamp, mensagem)
```

---

## 🛠️ Como Debugar

### 1. Verificar Variáveis de Ambiente

```javascript
// No console do navegador (F12)
console.log('URL:', import.meta.env.VITE_GOOGLE_SCRIPT_URL)
console.log('TOKEN:', import.meta.env.VITE_GOOGLE_SCRIPT_TOKEN)
```

**Se aparecer `undefined`:**
- Verifique se `.env.local` existe
- Reinicie o servidor (vite)

### 2. Verificar Requisição HTTP

```javascript
// No Chrome DevTools > Network tab
// 1. Abra F12
// 2. Clique em "Network"
// 3. Realize uma ação (salvar OP)
// 4. Procure por requisição POST
// 5. Verifique:
//    - Status (200 = OK, 40x = erro)
//    - Headers (Content-Type, etc)
//    - Request body (dados enviados)
//    - Response (resposta do servidor)
```

### 3. Verificar Histórico de Execução do Apps Script

```
1. Acesse project.google.com
2. Clique no projeto "SistemaOP - API"
3. Clique em "Execuções" (na aba esquerda)
4. Procure pela execução mais recente
5. Verifique:
   - Status (sucesso/erro)
   - Tempo de execução
   - Logs (Logger.log)
   - Erros (se houver)
```

### 4. Adicionar Logging Detalhado

**No Apps Script (código de backend):**
```javascript
function doPost(e) {
  try {
    Logger.log('=== NOVA REQUISIÇÃO ===');
    Logger.log('Timestamp: ' + new Date().toISOString());
    Logger.log('Parâmetros: ' + JSON.stringify(e.parameter || {}));
    Logger.log('Content-Type: ' + e.contentLength);
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Action: ' + data.action);
    
    // ... resto do código
    
    Logger.log('Resposta enviada com sucesso');
  } catch (error) {
    Logger.log('ERRO: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return respondWithError(error.toString());
  }
}
```

**No React (código de frontend):**
```javascript
// googleSheetsService.js
async saveOP(op) {
  try {
    console.log('[saveOP] Iniciando...', op);
    
    const url = this._getAuthorizedUrl();
    console.log('[saveOP] URL:', url);
    
    const payload = {
      action: 'saveOP',
      op: op,
      sheetName: SHEET_NAME
    };
    console.log('[saveOP] Payload:', payload);
    
    const response = await axios.post(url, payload);
    console.log('[saveOP] Resposta recebida:', response.data);
    
    if (response.data.success) {
      console.log('[saveOP] Sucesso!', response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error('[saveOP] Erro:', error.message);
    throw error;
  }
}
```

### 5. Testar Localmente no Apps Script

```javascript
// Adicione esta função no Apps Script e execute (Run)
function testSaveOPLocally() {
  try {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName('OPs Produção');
    
    const testOP = {
      numero: 9999,
      data: new Date().toISOString().split('T')[0],
      itens: [
        {
          itemName: 'Teste',
          qtdCones: 10,
          qtdRocas: 2,
          pesoTotal: 25
        }
      ]
    };
    
    Logger.log('Salvando OP de teste...');
    const result = saveOP(sheet, testOP);
    Logger.log('Resultado:', JSON.stringify(result));
    
  } catch (error) {
    Logger.log('Erro no teste: ' + error.toString());
  }
}
```

---

## 🔍 Checklist de Debug

### Erro ao Conectar
- [ ] `.env.local` existe?
- [ ] `VITE_GOOGLE_SCRIPT_URL` está correto?
- [ ] Token está preenchido (mesmo que genérico)?
- [ ] Apps Script foi deployado?
- [ ] URL termina com `/usercopy`?

### Erro 403 Forbidden
- [ ] Token está correto em `VALID_TOKENS[]` do Apps Script?
- [ ] `.env.local` tem o mesmo token?
- [ ] Compartilhou a planilha com a conta do Apps Script?

### Erro Sheet Not Found
- [ ] Nome da aba é exatamente **"OPs Produção"** (maiúscula)?
- [ ] Aba existe na planilha?
- [ ] `SPREADSHEET_ID` está correto no Apps Script?

### Dados não Salvam
- [ ] Verifique histórico de execuções do Apps Script
- [ ] Verifique logs (Logger.log) no Apps Script
- [ ] Permissões da planilha?
- [ ] Quota de API (Google tem limite)?

### Response Vazia
- [ ] Verifique estrutura da resposta em DevTools
- [ ] Verifique função `respond()` retorna JSON?
- [ ] Verifique `ContentService.MimeType.JSON`?

---

## 📊 Exemplo de Resposta JSON

### Sucesso (saveOP)
```json
{
  "success": true,
  "numero": 123,
  "mensagem": "OP salva com sucesso"
}
```

### Sucesso (getAllOPs)
```json
{
  "success": true,
  "ops": [
    {
      "numero": 1,
      "data": "2024-02-08",
      "itens": "Item A, Item B",
      "qtdCones": 100,
      "qtdRocas": 25,
      "pesoTotal": 250
    }
  ],
  "count": 1
}
```

### Erro
```json
{
  "success": false,
  "error": "Número de OP 123 já existe"
}
```

---

## 🚨 Mensagens de Erro Comuns

| Erro | Causa Provável | Solução |
|------|-----------------|---------|
| **"Não autorizado"** | Token inválido | Verifique `.env.local` |
| **"Sheet não encontrada"** | Nome da aba errado | Mude para "OPs Produção" |
| **"Número de OP já existe"** | OP duplicada | Mude o número |
| **"Erro ao salvar OP"** | Generic erro no backend | Verifique logs do Apps Script |
| **Network Error** | Conexão com server falhou | Verifique URL e internet |

---

## 📱 Teste Rápido (cURL)

```bash
# Testar conexão com o Apps Script
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy?token=seu-token" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getLastOPNumber",
    "sheetName": "OPs Produção"
  }'
```

Deve retornar:
```json
{
  "success": true,
  "lastNumber": 123
}
```

---

## 💾 Salvando Logs para Análise

**No Apps Script, criar sheet "Logs":**
```javascript
function setupLogsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const logsSheet = spreadsheet.insertSheet('Logs');
  logsSheet.appendRow(['Timestamp', 'Action', 'Status', 'Message', 'Data']);
}

function logAction(action, status, message, data = {}) {
  const spreadsheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName('Logs');
  
  spreadsheet.appendRow([
    new Date().toISOString(),
    action,
    status,
    message,
    JSON.stringify(data)
  ]);
}

// Usar em cada função:
function saveOP(sheet, op) {
  try {
    // ... código
    logAction('saveOP', 'success', 'OP salva', { numero: op.numero });
  } catch (error) {
    logAction('saveOP', 'error', error.toString(), { op });
    throw error;
  }
}
```

---

## 🎯 Próximas Ações

1. **Implementar o projeto** (seguir GOOGLE_APPS_SCRIPT_STANDALONE.md)
2. **Adicionar logs** (seguir acima)
3. **Testar completamente** (usar checklist de debug)
4. **Monitorar em produção** (verificar histórico de execuções)

---

_Guia de debugging: Fevereiro de 2026_
