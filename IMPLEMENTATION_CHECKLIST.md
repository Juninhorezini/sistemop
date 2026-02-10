# ✅ Checklist de Implementação Completo

> Controle passo a passo da migração para Google Apps Script Standalone

---

## 📚 Dicas de Leitura

Para entender completamente o projeto, leia nesta ordem:

1. **[REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)** ← COMECE AQUI
   - Resumo executivo da mudança
   - Arquitetura nova
   - Benefícios

2. **[GOOGLE_APPS_SCRIPT_STANDALONE.md](./GOOGLE_APPS_SCRIPT_STANDALONE.md)**
   - Passo a passo de implementação
   - Configuração detalhada
   - Testes

3. **[DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)**
   - Se tiver problemas
   - Como debugar
   - Exemplos práticos

4. **[APPS_SCRIPT_BEST_PRACTICES.md](./APPS_SCRIPT_BEST_PRACTICES.md)**
   - Segurança
   - Performance
   - Manutenção

5. **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)**
   - Detalhes técnicos
   - Referência completa
   - Troubleshooting

---

## 🎯 Fase 1: Preparação (5 minutos)

### Verificar Pré-requisitos

- [ ] **Conta Google ativa**
  ```
  Você tem uma conta gmail.com ou workspace?
  Teste: acesse google.com
  ```

- [ ] **Acesso ao Google Sheets**
  ```
  Você consegue acessar sua planilha?
  Link: https://sheets.google.com
  ```

- [ ] **Acesso ao Google Apps Script**
  ```
  Você consegue acessar script.google.com?
  Se não, ative a API no Google Cloud Console
  ```

- [ ] **Projeto React rodando localmente**
  ```
  Terminal: npm run dev
  Browser: http://localhost:5173
  ```

### Coletar Informações

- [ ] **ID da Planilha**
  ```
  Onde encontrar:
  URL: https://docs.google.com/spreadsheets/d/
  Copie: ID_AQUI/edit
  
  ID: ___________________________________
  ```

- [ ] **E-mail da conta Google**
  ```
  E-mail: ___________________________________
  ```

---

## 🚀 Fase 2: Criar Google Apps Script Standalone (20 minutos)

### Passo 1: Novo Projeto
- [ ] Acesse [script.google.com](https://script.google.com)
- [ ] Clique em **Novo projeto**
- [ ] Nomeie: `SistemaOP - API`
- [ ] Clique em **Criar**

### Passo 2: Copiar Código
- [ ] Abra [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
- [ ] Copie o código JavaScript (seção "### Passo 1: Criar o Script")
- [ ] Cole no editor do Apps Script
- [ ] Limpe o código padrão primeiro

### Passo 3: Configurar ID da Planilha
- [ ] Encontre a linha: `const SPREADSHEET_ID = 'SEU_SPREADSHEET_ID_AQUI'`
- [ ] Substitua pelo ID coletado (Fase 1)
- [ ] Salve (Ctrl+S)

### Passo 4: Testar Localmente
- [ ] No Apps Script, selecione função: `getLastOPNumber`
- [ ] Clique em **Executar**
- [ ] Autorize se solicitado
- [ ] Verifique se retornou sucesso nos logs

**Resultado esperado:**
```
Execução concluída com sucesso em X ms
Saída: {...}
```

### Passo 5: Fazer Deploy
- [ ] Clique em **Implantar** (botão cinza no topo)
- [ ] Selecione **Nova implantação**
- [ ] Clique em **Selecionar tipo**
- [ ] Escolha **Aplicação web**
- [ ] **Executar como**: Sua conta Google
- [ ] **Quem tem acesso**: Qualquer pessoa
- [ ] Clique em **Implantar**

### Passo 6: Copiar URL
- [ ] Após deploy, copie a URL completa
- [ ] Formato: `https://script.google.com/macros/s/YOUR_ID/usercopy`
- [ ] Salve em um local seguro

**URL do Deployment:**
```
_______________________________________________________________
```

---

## ⚙️ Fase 3: Configurar Projeto React (10 minutos)

### Passo 1: Criar .env.local
- [ ] Na raiz do projeto, crie arquivo `.env.local`
- [ ] Se já existir, abra para editar

**Conteúdo:**
```env
VITE_GOOGLE_SCRIPT_URL=<COPIE_A_URL_DO_PASSO_6>
```

**Exemplo:**
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/1ABC123XYZ/usercopy
```

### Passo 2: Reiniciar Servidor
```bash
# Se rodando:
# Ctrl+C para parar

# Reinicie:
npm run dev

# Verifique no navegador:
# http://localhost:5173
```

### Passo 3: Verificar Carregamento
- [ ] Abra o navegador em http://localhost:5173
- [ ] Abra console (F12)
- [ ] Procure por erros relacionados a VITE_GOOGLE_SCRIPT_URL
- [ ] Se houver `undefined`, mude para Fase 4

---

## 🧪 Fase 4: Testar Integração (15 minutos)

### Teste 1: Verificar Conexão
```javascript
// No console do navegador (F12 > Console)
// Use fetch em vez de import

const response = await fetch(
  'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getLastOPNumber',
      sheetName: 'OPs Produção'
    })
  }
);
const data = await response.json();
console.log('Teste de conexão:', data);
// Deve retornar: { success: true, lastNumber: 123 }
```

### Teste 2: Buscar Último Número
```javascript
// No console
const response = await fetch(
  'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getLastOPNumber',
      sheetName: 'OPs Produção'
    })
  }
);
const data = await response.json();
console.log('Último número:', data.lastNumber);
// Deve retornar: número (ex: 123)
```

### Teste 3: Buscar Todas as OPs
```javascript
// No console
const response = await fetch(
  'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getAllOPs',
      sheetName: 'OPs Produção'
    })
  }
);
const data = await response.json();
console.log('Todas as OPs:', data.ops);
// Deve retornar: array de OPs (pode estar vazio)
```

### Teste 4: Salvar OP (Manual)
- [ ] Navegue até a aba "Gerador de OPs"
- [ ] Preencha o formulário com:
  ```
  Número: (será auto-incrementado)
  Data: (data de hoje)
  Itens: 
    - Nome: "Item Teste"
    - Qtd Cones: 50
    - Qtd Rocas: 13
    - Peso Total: 130
  ```
- [ ] Clique em **Salvar OP**
- [ ] Observe a mensagem de sucesso

### Teste 5: Verificar na Planilha
- [ ] Abra sua planilha no Google Sheets
- [ ] Verifique aba "OPs Produção"
- [ ] Procure pela OP que acabou de salvar
- [ ] Verifique os dados estão corretos

**Dados esperados na planilha:**
```
Número: 124 (ou próximo)
Data: 2026-02-09 (ou data de hoje)
Itens: Item Teste
Qtd Cones: 50
Qtd Rocas: 13
Peso Total: 130
Data Envio: timestamp
```

### Teste 6: Testar CRUD Completo
- [ ] **C** - Salvar: ✅ Feito acima
- [ ] **R** - Buscar: `await googleSheetsService.getAllOPs()`
- [ ] **U** - Atualizar: Editar uma OP existente na UI
- [ ] **D** - Deletar: Deletar uma OP existente na UI

---

## � Fase 5: Monitoramento e Manutenção (5 minutos)

### Verificar Histórico de Execuções
- [ ] Acesse [script.google.com](https://script.google.com)
- [ ] Clique no projeto "SistemaOP - API"
- [ ] Clique em **Execuções** (esquerda)
- [ ] Verifique:
  - [ ] Status das últimas execuções
  - [ ] Tempo de resposta
  - [ ] Se há erros

### Adicionar Logging (Opcional)
- [ ] No Apps Script, adicione `Logger.log()` em pontos críticos
- [ ] Verifique logs na aba "Execuções"
- [ ] Use para monitorar problemas

### Manutenção Periódica
- [ ] **Semanal**: Verificar histórico de execuções
- [ ] **Mensal**: Backup da planilha
- [ ] **Trimestral**: Revisar e atualizar código

---

## 🐛 Fase 6: Troubleshooting

### Se Erro ao Conectar

1. **Verifique `.env.local`:**
   ```bash
   # No terminal, na raiz do projeto
   cat .env.local
   ```

2. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

3. **Teste no console:**
   ```javascript
   console.log(import.meta.env.VITE_GOOGLE_SCRIPT_URL)
   // Deve mostrar a URL, não 'undefined'
   ```

### Se Erro "Não Autorizado"

1. **Verifique token em `.env.local`:**
   ```env
   VITE_GOOGLE_SCRIPT_TOKEN=seu-token-secreto-aqui
   ```

2. **Verifique token no Apps Script:**
   ```javascript
   const VALID_TOKENS = ['seu-token-secreto-aqui'];
   // Deve ser EXATAMENTE igual
   ```

3. **Reimplante o script:**
   - Clique em **Implantar** > **Gerencie implantações** > **Editar** > **Criar nova versão** > **Implantar**

### Se Sheet Não Encontrada

1. **Verifique nome da aba:**
   - Deve ser exatamente: `"OPs Produção"` (com acento)
   - Respeitando maiúsculas/minúsculas

2. **Verifique ID da planilha:**
   ```javascript
   // No Apps Script
   const SPREADSHEET_ID = '...'; // Deve estar correto
   ```

### Se Dados Não Salvam

1. **Verifique permissões:**
   - Na planilha, clique em **Compartilhar**
   - Certifique-se de que compartilhou com você mesmo

2. **Verifique histórico:**
   - Apps Script > **Execuções**
   - Procure por mensagens de erro

3. **Consulte [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)**

---

## ✨ Fase 7: Próximos Passos Opcionais

- [ ] Adicionar logging estruturado (ver [APPS_SCRIPT_BEST_PRACTICES.md](./APPS_SCRIPT_BEST_PRACTICES.md))
- [ ] Implementar cache (melhor performance)
- [ ] Adicionar rate limiting (proteção)
- [ ] Monitorar em Cloud Logging
- [ ] Criar backup automático
- [ ] Documentar API (se for compartilhar)

---

## 📋 Resumo Rápido

| Fase | Tempo | Status |
|------|-------|--------|
| 1. Preparação | 5 min | ░░░░░░░░░░ |
| 2. Google Apps Script | 20 min | ░░░░░░░░░░ |
| 3. Configurar React | 10 min | ░░░░░░░░░░ |
| 4. Testar Integração | 15 min | ░░░░░░░░░░ |
| 5. Monitoramento | 5 min | ░░░░░░░░░░ |
| 6. Troubleshooting | ? min | ░░░░░░░░░░ |
| **TOTAL** | **~55 min** | ░░░░░░░░░░ |

---

## 🎉 Conclusão

Após completar todas as fases, você terá:

✅ **Projeto Google Apps Script standalone**
✅ **Integração segura com autenticação**
✅ **App React funcionando perfeitamente**
✅ **Planilha sem carga de scripts**
✅ **Capacidade de monitoramento**

---

## 📞 Suporte

Se tiver dúvidas:

1. **Primeira vez:** Leia [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)
2. **Implementando:** Siga [GOOGLE_APPS_SCRIPT_STANDALONE.md](./GOOGLE_APPS_SCRIPT_STANDALONE.md)
3. **Com erros:** Consulte [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)
4. **Otimizações:** Veja [APPS_SCRIPT_BEST_PRACTICES.md](./APPS_SCRIPT_BEST_PRACTICES.md)

---

**Bom trabalho! 🚀**

_Última atualização: Fevereiro de 2026_
