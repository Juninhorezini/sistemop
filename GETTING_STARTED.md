# 🎯 Getting Started - Checklist de Primeiro Uso

## ⚡ 1. Apenas Clonou o Repo? Siga Isto:

### Step 1: Install Dependencies
```bash
cd c:\Users\USER\projetos\sistemaop2
npm install
```
⏱️ Tempo: 2-3 minutos  
✅ Deve terminar sem erros

### Step 2: Configure Environment
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyDEOW_lTXxqxUgmXn4qm3FHSw7P_WQ_lE0
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/COLOQUE_SEU_ID/usercopy
```

### Step 3: Start Development
```bash
npm run dev
```

Abra: **http://localhost:3000**

✅ Pronto! O app está rodando.

---

## 🧪 2. Primeiro Teste - Adicionar Item

1. Clique na aba **"Configurações"**
2. Clique em **"Novo Item"**
3. Preencha:
   ```
   ID: ITEM001
   Nome: Algodão A
   Peso Cone: 2.5
   Peso Roça: 10
   Insumo: Algodão
   ```
4. Clique em **"Adicionar"**

✅ Item aparece na tabela!

---

## 📋 3. Segundo Teste - Criar OP

1. Clique na aba **"Gerador de OP"**
2. A data está preenchida automaticamente ✅
3. No campo "Item", selecione **"Algodão A"**
4. Preencha "Quantidade de Cones": **100**
5. Clique em **"Adicionar"**

✅ Veja os cálculos automáticos:
- Qtd Rocas: 25 (CEIL)
- Peso Total: 250 kg

---

## 🖨️ 4. Terceiro Teste - Gerar PDF

1. Com a OP preenchida, clique em **"Imprimir"**
2. Um arquivo PDF deve baixar automático

✅ PDF gerado com sucesso!

---

## 💾 5. Quarto Teste - Salvar na Planilha

⚠️ **Importante**: Requer Google Apps Script configurado

1. Clique em **"Salvar OP"**
2. Confirme a salva
3. Verifique a planilha Google Sheets

Se aparecer erro:
- Verifique a URL do Google Apps Script em `.env.local`
- Confirme que o script foi implantado
- Veja: GOOGLE_SHEETS_SETUP.md

---

## 📁 6. Estrutura de Arquivos

Importante conhecer:

```
src/
├── components/     # Componentes React (UI)
├── store/         # Gerenciamento de Estado
├── services/      # APIs e Google Sheets
├── utils/         # Funções auxiliares
└── styles/        # Estilos CSS
```

---

## 🔧 7. Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia servidor local (porta 3000)

# Build para produção
npm run build        # Cria pasta /dist

# Preview da build
npm run preview      # Testa a versão de produção

# Linting
npm run lint         # Verifica estilo do código

# Limpar cache
rm -rf node_modules
npm install

# Limpar localStorage (no console do navegador)
localStorage.clear()
```

---

## 🐛 8. Troubleshooting Rápido

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 3000 já em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Google Sheets não funciona
- [ ] Verificar URL em .env.local
- [ ] Confirmar Google Apps Script implantado
- [ ] Testar em outro navegador
- [ ] Abrir DevTools (F12) e verificar erros

### PDF não gera
- [ ] Desabilitar ad-blockers
- [ ] Testar em Chrome (preferido)
- [ ] Limpar cache/cookies
- [ ] Verificar console para erros

### localStorage limpo?
- [ ] F12 → Application → localStorage
- [ ] Verificar se há dados salvos
- [ ] Adicionar item novo

---

## 📚 9. Leitura Recomendada

Na ordem:
1. **QUICK_START.md** - Guia rápido
2. **README.md** - Overview completo
3. **GOOGLE_SHEETS_SETUP.md** - Integração API
4. **NETLIFY_DEPLOYMENT.md** - Deploy

---

## ✅ 10. Checklist de Primeiro Uso

- [ ] `npm install` pronto
- [ ] `.env.local` configurado
- [ ] `npm run dev` rodando
- [ ] Página abre em localhost:3000
- [ ] Abas "Configurações" e "Gerador de OP" visíveis
- [ ] Adicionou um item em Configurações
- [ ] Criou uma OP em Gerador de OP
- [ ] PDF foi gerado com sucesso
- [ ] Abriu console (F12) e sem erros críticos

✅ Tudo funcionando? Parabéns! 🎉

---

## 🚀 11. Próximo Passo: Deploy

Pronto para colocar em produção?

Ver: **NETLIFY_DEPLOYMENT.md**

```bash
# Build para produção
npm run build

# Saída em /dist - pronta para deploy
```

---

## 💬 12. Precisa de Ajuda?

Consulte:
- **GOOGLE_SHEETS_SETUP.md** - Integração Google
- **NETLIFY_DEPLOYMENT.md** - Deployment
- **README.md** - FAQ & Troubleshooting
- Console do navegador (F12) - Erros específicos

---

**Tudo pronto? Bora colocar em produção!** 🚀

Tempo total: **~30 minutos** ⏱️
