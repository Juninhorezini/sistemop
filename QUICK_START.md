# 🚀 Quick Start Guide

## Primeiros Passos

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/juninhorezini/sistemop2.git
cd sistemop2
```

### 2️⃣ Instalar Dependências
```bash
npm install
```

### 3️⃣ Setup Environment
```bash
# Copiar arquivo de configuração
cp .env.example .env.local

# Editar .env.local com seus valores
nano .env.local
```

Configurações necessárias:
```
# Google Sheets API Key (opcional para testes locais)
VITE_GOOGLE_SHEETS_API_KEY=sua_chave_aqui

# Google Apps Script URL (mais importante)
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/SEU_ID/usercopy
```

### 4️⃣ Rodar Localmente
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🎯 Primeiros Testes

### Teste 1: Adicionar Itens (Configurações)
1. Clique na aba "Configurações"
2. Clique em "Novo Item"
3. Preencha os dados:
   - ID: `ITEM001`
   - Nome: `Algodão A`
   - Peso Cone: `2.5`
   - Peso Roça: `10`
   - Insumo: `Algodão`
4. Clique em "Adicionar"

✅ Item deve aparecer na tabela

### Teste 2: Criar OP (Gerador de OP)
1. Clique na aba "Gerador de OP"
2. A data deve estar preenchida com Today
3. Clique no campo "Item" e busque "Algodão A"
4. Preencha "Quantidade de Cones": `100`
5. Clique em "Adicionar"

✅ Calculado automaticamente:
- Qtd Rocas: 25 (calculado via CEIL)
- Peso Total: 250 kg

### Teste 3: Gerar PDF
1. Com itens adicionados, clique em "Imprimir"
2. Arquivo PDF deve ser baixado

✅ PDF contém a OP formatada

### Teste 4: Salvar na Planilha
1. Clique em "Salvar OP"
2. Confirme o salvamento
3. Verifique se os dados apareceram na planilha

⚠️ Requer Google Apps Script configurado

## 📂 Estrutura Rápida

```
src/
├── components/        # Componentes React
├── store/            # Zustand store
├── services/         # APIs & Google Sheets
├── utils/            # Funções auxiliares
└── styles/           # Estilos globais

public/               # Assets estáticos
dist/                 # Build produção (gerado)
```

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor local

# Build
npm run build        # Gera arquivos para produção
npm run preview      # Preview da build

# Linting
npm run lint         # Verifica estilo de código

# Limpar cache
rm -rf node_modules
npm install

# Limpar localStorage
# No console do navegador:
localStorage.clear()
```

## ⚙️ Configuração Google Sheets (Importante!)

Para a integração funcionar você PRECISA:

### 1. Criar Google Apps Script
```javascript
// Ir em Google Sheets > Extensões > Apps Script
// Copiar código de GOOGLE_SHEETS_SETUP.md
// Implantar como "Aplicação Web"
// Copiar URL gerada
```

### 2. Adicionar URL ao .env.local
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/d/COPIE_AQUI/usercopy
```

### 3. Testar Integração
```javascript
// No console do navegador
fetch('sua_url_aqui', {
  method: 'POST',
  body: JSON.stringify({ action: 'getLastOPNumber' })
})
.then(r => r.json())
.then(console.log)
```

## 🐛 Troubleshooting Comum

### Erro: "Cannot find module"
```bash
# Solução:
rm -rf node_modules
npm install
```

### Erro: "VITE_GOOGLE_SCRIPT_URL undefined"
```bash
# Verificar se .env.local existe e contém a variável
cat .env.local

# Reiniciar o servidor
npm run dev
```

### localStorage vazio ao recarregar
- Verifique se localStorage está habilitado
- Tente em outro navegador
- Limpe cookies/cache

### PDF não gera
- Tente em outro navegador
- Desabilite ad-blockers
- Verifique console (F12) para erros

## 📊 Estrutura de Dados

### Item (Configurações)
```javascript
{
  id: 1,
  idItem: "ITEM001",
  nome: "Algodão A",
  pesoCone: 2.5,
  pesoRoca: 10,
  insumo: "Algodão"
}
```

### OP (Ordem de Produção)
```javascript
{
  numero: 1,
  data: "2024-02-08",
  itens: [
    {
      itemId: 1,
      itemName: "Algodão A",
      qtdCones: 100,
      qtdRocas: 25,        // CEIL((100 * 2.5) / 10)
      pesoTotal: 250,      // 25 * 10
      pesoCone: 2.5,
      pesoRoca: 10
    }
  ],
  isDirty: false
}
```

## 🚀 Deploy no Netlify

```bash
# 1. Preparar repositório
git add .
git commit -m "Initial commit"
git push origin main

# 2. Conectar ao Netlify
# Ver: NETLIFY_DEPLOYMENT.md

# 3. Variáveis de Ambiente
# Site Settings > Build & deploy > Environment
# VITE_GOOGLE_SHEETS_API_KEY = xxx
# VITE_GOOGLE_SCRIPT_URL = xxx

# 4. Deploy automático
# Cada push em main = novo deploy
```

## 📖 Documentação Completa

- [README.md](./README.md) - Overview completo
- [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) - Integração API
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - Deploy
- [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) - Ciclo de desenvolvimento
- [ROADMAP.md](./ROADMAP.md) - Futuras melhorias

## ✅ Checklist de Deployment

Antes de ir para produção:

- [ ] `npm run build` sem erros
- [ ] Testar em 3 navegadores diferentes
- [ ] Testar responsividade (mobile/tablet)
- [ ] Google Sheets integração testada
- [ ] PDF generation funcionando
- [ ] .env.local não fez commit
- [ ] Variáveis de env configuradas no Netlify
- [ ] HTTPS habilitado
- [ ] Domain customizado (opcional)

## 💬 Suporte

Adicionar issues em: `https://github.com/seu-usuario/sistemop/issues`

Incluir:
- Descrição do problema
- Passos para reproduzir
- Screenshots/videos
- Versão navegador
- Console errors (F12)

---

**Pronto para começar? 🎉**

```bash
npm install && npm run dev
```

Abra `http://localhost:3000` e divirta-se!
