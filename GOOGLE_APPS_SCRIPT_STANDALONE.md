# Guia Rápido: Projeto Google Apps Script Standalone

> Instruções passo a passo para criar e configurar um projeto Apps Script independente da planilha

## ✅ Checklist Rápido

- [ ] Criar novo projeto em script.google.com
- [ ] Copiar código do script
- [ ] Obter ID da planilha
- [ ] Configurar permissões
- [ ] Fazer deploy como aplicação web
- [ ] Adicionar URL e token no `.env.local`

---

## 1️⃣ Criar Novo Projeto Apps Script

1. Abra [script.google.com](https://script.google.com)
2. Clique em **Novo projeto**
3. Nomeie como: `SistemaOP - API`
4. Clique em **Criar**

---

## 2️⃣ Adicionar o Código

1. Limpe o código padrão da página
2. Cole o código completo do [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) (seção de código JavaScript)
3. **Importante**: Procure por `const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI';` e prepare para adicionar o ID no próximo passo
4. Clique em **Salvar**

---

## 3️⃣ Obter o ID da Sua Planilha

1. Abra sua planilha no [Google Sheets](https://sheets.google.com)
2. Observe a URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123XYZ456def789/edit
   ```
3. Copie o ID (entre `/d/` e `/edit`):
   ```
   1ABC123XYZ456def789
   ```

---

## 4️⃣ Configurar o ID no Script

1. Volte para o projeto Apps Script
2. Encontre a linha:
   ```javascript
   const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI';
   ```
3. Substitua por seu ID:
   ```javascript
   const SPREADSHEET_ID = '1ABC123XYZ456def789';
   ```
4. Clique em **Salvar** (Ctrl+S)

---

## 5️⃣ Configurar Permissões

1. No Apps Script, clique em **Configurações** (engrenagem no canto esquerdo)
2. Anote o **ID do projeto** (você precisará depois)
3. Abra sua planilha no Google Sheets
4. Clique em **Compartilhar** (botão azul, canto superior direito)
5. Cole o ID do projeto Apps Script ou o e-mail associado
6. Conceda acesso de **Editor**

### Alternativa: Usar suas próprias credenciais
Se for usar a planilha com sua conta pessoal, basta que você tenha acesso tanto ao Apps Script quanto à planilha.

---

## 6️⃣ Fazer o Deploy

1. No proyecto Apps Script, clique em **Implantar** (botão cinza, canto superior direito)
2. Selecione **Nova implantação**
3. Clique em **Selecionar tipo** > **Aplicação web**
4. Configure:
   - **Executar como**: Sua conta Google
   - **Quem tem acesso**: Qualquer pessoa
5. Clique em **Implantar**
6. **Copie a URL** que aparece (aquela com `/macros/s/...`)
7. Clique em **Fechar**

---

## 7️⃣ Configurar no App React

### Arquivo `.env.local`

Crie (ou atualize) o arquivo `.env.local` na raiz do projeto:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_SCRIPT_ID/usercopy
VITE_GOOGLE_SCRIPT_TOKEN=seu-token-secreto-aqui
```

Substitua:
- `SEU_SCRIPT_ID` pela URL que copiou no passo anterior
- `seu-token-secreto-aqui` por um token aleatório (ex: `abc123xyz789`)

### Atualizar googleSheetsService.js

No arquivo [src/services/googleSheetsService.js](./src/services/googleSheetsService.js), atualize a URL:

```javascript
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const SCRIPT_TOKEN = import.meta.env.VITE_GOOGLE_SCRIPT_TOKEN;

async function request(action, data = {}) {
  const url = `${SCRIPT_URL}?token=${SCRIPT_TOKEN}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      ...data
    })
  });
  
  return response.json();
}
```

---

## 8️⃣ Ativar Token no Apps Script (Segurança)

Se quiser adicionar segurança:

1. Volte ao projeto Apps Script
2. No topo do código, encontre:
   ```javascript
   const SHEET_NAME = 'OPs Produção';
   const SPREADSHEET_ID = '1ABC123XYZ456def789';
   ```
3. Adicione antes:
   ```javascript
   const VALID_TOKENS = ['seu-token-secreto-aqui'];
   ```
4. Na função `doPost`, adicione validação (veja [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) na seção de Segurança)
5. Coloque uma **nova versão** (ver próxima seção)

---

## 🔄 Atualizar o Código Futuramente

Sempre que modificar o código do Apps Script:

1. Clique em **Implantar** > **Gerencie implantações**
2. Clique no ícone de **editar** (lápis) na implantação ativa
3. Selecione **Criar nova versão**
4. Clique em **Implantar**
5. A URL permanece a mesma!

---

## 🧪 Testar

Após configurar tudo:

1. Abra seu app React
2. Tente criar uma nova OP
3. Verifique se aparece na planilha do Google Sheets
4. Se houver erro, verifique:
   - Token está correto (se implementado)
   - URL está correta
   - ID da planilha está correto
   - Você tem acesso à planilha

---

## ❌ Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| **403 Forbidden** | Sem autorização | Reconfira token e permissões |
| **404 Not Found** | URL inválida | Reimplante e copie URL novamente |
| **Sheet não encontrada** | Nome da aba errado | Verifique se é exatamente "OPs Produção" |
| **Erro ao conectar** | SPREADSHEET_ID errado | Copie novamente da URL da planilha |

---

## 💡 Próximos Passos

- [x] Projeto standalone criado
- [ ] Implementar autenticação mais robusta (OAuth)
- [ ] Adicionar logging/monitoring
- [ ] Criar backup automático da planilha
- [ ] Adicionar validações adicionais

---

**Dúvidas?** Consulte [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para mais detalhes técnicos.
