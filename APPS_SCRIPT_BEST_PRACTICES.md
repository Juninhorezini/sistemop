# Melhores Práticas: Google Apps Script Standalone

> Guia de otimização e segurança para seu projeto Google Apps Script

---

## 🔒 Segurança

### 1. Token de Autenticação
✅ **Implementado no seu projeto**

Seu script recebe um token do cliente:
```env
VITE_GOOGLE_SCRIPT_TOKEN=seu-token-secreto
```

No Apps Script:
```javascript
const VALID_TOKENS = ['seu-token-secreto'];

function doPost(e) {
  const token = e.parameter.token;
  if (!VALID_TOKENS.includes(token)) {
    return respondWithError('Não autorizado');
  }
  // ... resto do código
}
```

**Boas práticas:**
- ✅ Use token longo e aleatório (mínimo 32 caracteres)
- ✅ Armazene no `.env.local` (nunca em código)
- ✅ Rotação periódica de tokens (recomendado a cada 3 meses)

### 2. Rate Limiting
Implemente throttling para evitar abuso:

```javascript
const requestCache = {};

function shouldBlockRequest(clientId) {
  const now = Date.now();
  const lastRequest = requestCache[clientId] || 0;
  
  // Máximo 5 requisições por segundo
  if (now - lastRequest < 1000 / 5) {
    return true;
  }
  
  requestCache[clientId] = now;
  return false;
}

function doPost(e) {
  const clientId = e.parameter.token || e.source.getIp();
  
  if (shouldBlockRequest(clientId)) {
    return respondWithError('Muitas requisições. Tente novamente mais tarde.');
  }
  
  // ... resto do código
}
```

### 3. Validação de Entrada
Nunca confie em dados do cliente:

```javascript
function saveOP(sheet, op) {
  // Validar campos obrigatórios
  if (!op || !op.numero || !op.data || !Array.isArray(op.itens)) {
    throw new Error('Dados inválidos');
  }
  
  // Validar tipos
  if (typeof op.numero !== 'number' || op.numero <= 0) {
    throw new Error('Número de OP inválido');
  }
  
  // Validar range de datas
  const opDate = new Date(op.data);
  if (isNaN(opDate.getTime())) {
    throw new Error('Data inválida');
  }
  
  // Validar itens
  op.itens.forEach(item => {
    if (!item.itemName || typeof item.qtdCones !== 'number') {
      throw new Error('Itens inválidos');
    }
  });
  
  // ... continuar
}
```

---

## ⚡ Performance

### 1. Cache em Memória
Evite leituras repetidas:

```javascript
const cache = {
  ops: null,
  lastFetch: 0,
  TTL: 5 * 60 * 1000 // 5 minutos
};

function getAllOPs(sheet) {
  const now = Date.now();
  
  // Retornar do cache se ainda válido
  if (cache.ops && (now - cache.lastFetch) < cache.TTL) {
    return cache.ops;
  }
  
  // Buscar dados
  const data = sheet.getDataRange().getValues();
  const ops = data.slice(1).map(row => ({
    numero: row[0],
    data: row[1],
    // ...
  }));
  
  // Atualizar cache
  cache.ops = ops;
  cache.lastFetch = now;
  
  return ops;
}
```

### 2. Leitura Eficiente de Dados
Minimize operações de range:

```javascript
// ❌ Ineficiente: múltiplas leituras
for (let i = 0; i < 100; i++) {
  const range = sheet.getRange(i, 1);  // Uma leitura por linha
  Logger.log(range.getValue());
}

// ✅ Eficiente: leitura em batch
const values = sheet.getRange(1, 1, 100, 7).getValues();  // Uma leitura
values.forEach(row => {
  Logger.log(row[0]);
});
```

### 3. Batch Operations
Agrupe operações de escrita:

```javascript
// ❌ Ineficiente
for (let i = 0; i < 100; i++) {
  sheet.appendRow([data[i]]);  // 100 operações
}

// ✅ Eficiente
const rows = data.map(item => [item]);
sheet.getRange(lastRow, 1, rows.length, 1).setValues(rows);  // 1 operação
```

---

## 📊 Logging & Monitoring

### 1. Structured Logging
```javascript
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };
  
  // Enviar para Google Sheets ou Cloud Logging
  Logger.log(JSON.stringify(logEntry));
}

function doPost(e) {
  try {
    log('INFO', 'Requisição recebida', { action: e.postData.action });
    // ... processar
  } catch (error) {
    log('ERROR', 'Erro ao processar', { error: error.toString() });
    return respondWithError(error.toString());
  }
}
```

### 2. Histórico de Execução
Monitore no painel "Execuções" do Apps Script:
- Clique em "Execuções" no Apps Script
- Monitore sucesso/erro
- Defina alertas para erros

### 3. Logging em Planilha (Opcional)
```javascript
function logToSheet(action, status, message) {
  const logSheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName('Logs');
  
  logSheet.appendRow([
    new Date(),
    action,
    status,
    message
  ]);
}
```

---

## 🚀 Escalabilidade

### 1. Separar Scripts por Funcionalidade
Em vez de uma grande função `doPost`:

```javascript
// ❌ Monolítico
function doPost(e) {
  switch(e.postData.action) {
    case 'action1': ...
    case 'action2': ...
    case 'action3': ...
    // ... 50+ casos
  }
}

// ✅ Modular
const handlers = {
  'saveOP': saveOP,
  'getAllOPs': getAllOPs,
  'updateOP': updateOP,
  'deleteOP': deleteOP
};

function doPost(e) {
  const handler = handlers[e.postData.action];
  if (!handler) {
    return respondWithError('Ação desconhecida');
  }
  return handler(e);
}
```

### 2. Usar Bibliotecas Externas
```javascript
// Apps Script > Bibliotecas > Adicionar biblioteca
// ID: bibliotecas úteis do Google
```

### 3. Cloud Functions (Alternativa Futura)
Para carga muito alta, migrar para:
```
Google Cloud Functions
  ↓
Google Sheets API
  ↓
Planilha
```

---

## 🔄 Versionamento & Deployment

### 1. Control de Versão
```javascript
const VERSION = '1.0.0'; // Atualize ao fazer deploy

function doPost(e) {
  const response = {
    version: VERSION,
    timestamp: new Date().toISOString(),
    ...resultado
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2. Rollback Plan
- Sempre manter versão anterior acessível
- Criar nova versão antes de atualizar
- Testar em ambiente de development primeiro

### 3. Change Log
```javascript
/**
 * CHANGELOG:
 * v1.0.0 - Deploy inicial
 *   - saveOP implementado
 *   - getAllOPs implementado
 * v1.1.0 - Adição de token
 *   - Implementado autenticação por token
 * v1.2.0 - Otimização de performance
 *   - Cache de OPs adicionado
 */
```

---

## 🧪 Testes

### 1. Testar Localmente
Use o editor do Apps Script:
```javascript
function testSaveOP() {
  const testOP = {
    numero: 999,
    data: '2026-02-09',
    itens: [
      {
        itemName: 'Item Teste',
        qtdCones: 50,
        qtdRocas: 13,
        pesoTotal: 130
      }
    ]
  };
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OPs Produção');
  const result = saveOP(sheet, testOP);
  Logger.log(JSON.stringify(result));
}
```

### 2. Teste de Integração
```javascript
function testIntegration() {
  const results = {
    getAllOPs: false,
    getLastOPNumber: false,
    saveOP: false
  };
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OPs Produção');
    
    results.getAllOPs = getAllOPs(sheet).length >= 0;
    results.getLastOPNumber = getLastOPNumber(sheet) >= 0;
    
    // Testar save (com rollback se falhar)
    // ...
    
  } catch (error) {
    Logger.log('Erro em testes: ' + error);
  }
  
  Logger.log(JSON.stringify(results));
}
```

---

## 📋 Checklist de Produção

- [ ] Implementar autenticação por token
- [ ] Adicionar rate limiting
- [ ] Validar todas as entradas
- [ ] Implementar cache
- [ ] Adicionar logging estruturado
- [ ] Testar com dados reais
- [ ] Monitorar histórico de execuções
- [ ] Documentar cada função
- [ ] Criar versões antes de updates
- [ ] Manter backup da planilha
- [ ] Testar rollback
- [ ] Documentar mudanças no CHANGELOG

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)
- Implementar token (se não feito)
- Adicionar logging básico
- Testar em produção

### Médio Prazo (1-2 meses)
- Cache de dados
- Rate limiting
- Monitoramento em Cloud Logging

### Longo Prazo (3-6 meses)
- Migrar para Cloud Functions
- Implementar GraphQL API
- Adicionar autenticação OAuth

---

## 📚 Referências

- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/best-practices)
- [Apps Script Optimization](https://developers.google.com/apps-script/guides/optimize)
- [Google Sheets API Performance](https://developers.google.com/sheets/api/guides/performance)

---

_Última atualização: Fevereiro de 2026_
