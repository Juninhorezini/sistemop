# Sistema de Gestão de Ordens de Produção (OP)

Um Web App responsivo para automação e gestão de Ordens de Produção com integração Google Sheets, desenvolvido com React + Vite.

## 🎯 Funcionalidades Principais

### 1. **Gerador de OP**
- Criação rápida de Ordens de Produção
- Data automática (Today) ao carregar
- Número da OP incrementado automaticamente baseado no histórico
- Busca inteligente de itens com dropdown searchable
- Cálculo automático de Quantidade de Rocas (CEIL)
- Validação de estado sujo (dirty state) antes de descartar alterações
- Resumo em tempo real das quantidades

### 2. **Configurações (CRUD de Itens)**
- Gerenciamento completo de itens de produção
- Campos: ID_Item, Nome, Peso_Cone, Peso_Roca, Insumo
- Persistência local (não salva na planilha)
- Edição e deleção com confirmação
- Validação de duplicidade de IDs

### 3. **Cálculos Automáticos**
```
Qtd Rocas = CEIL((Qtd Cones × Peso Cone) / Peso Roca)
Peso Total = Qtd Rocas × Peso Roca
```

### 4. **Persistência de Dados**
- **Local**: Configurações de itens (localStorage)
- **Google Sheets**: OPs finalizadas na aba "OPs Produção"
- Integridade de IDs com verificação de duplicidade

### 5. **Geração de PDF**
- Layout Landscape (Paisagem) para impressão
- 4 OPs por folha A4
- Design profissional e legível
- Download automático

### 6. **Responsividade**
- Mobile-first design
- Adaptação automática de tabelas em cards no mobile
- Interface intuitiva em todos os dispositivos

## 📋 Estrutura do Projeto

```
sistemop2/
├── src/
│   ├── components/
│   │   ├── UI.jsx              # Componentes reutilizáveis
│   │   ├── ConfiguracoesTab.jsx # Tab de CRUD de itens
│   │   └── GeradorOPTab.jsx    # Tab de gerador de OP
│   ├── store/
│   │   └── index.js            # Zustand stores (state management)
│   ├── services/
│   │   ├── googleSheetsService.js
│   │   └── pdfService.js
│   ├── utils/
│   │   └── helpers.js          # Funções utilitárias
│   ├── styles/
│   │   └── globals.css         # Estilos globais + Tailwind
│   ├── App.jsx                 # Componente principal
│   └── main.jsx                # Ponto de entrada
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🚀 Instalação e Setup

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/sistemop.git
cd sistemop
```

### 2. Instalar Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:
```
VITE_GOOGLE_SHEETS_API_KEY=sua_api_key
VITE_GOOGLE_SCRIPT_URL=seu_google_script_url
```

### 4. Desenvolvimento Local
```bash
npm run dev
```
A aplicação abrirá em `http://localhost:3000`

### 5. Build para Produção
```bash
npm run build
```

## 📊 Integração Google Sheets

### Configuração da Planilha
1. Acesse: [Google Sheets - OPs Produção](https://docs.google.com/spreadsheets/d/1CWw8zKMf1ww08gynis7qIAYFjaYJo3PYb8bghp35zYE/edit?gid=125558396)
2. Crie a aba "OPs Produção" com as colunas:
   - A: Número da OP
   - B: Data
   - C: Item
   - D: Qtd Cones
   - E: Qtd Rocas
   - F: Peso Total
   - G: Data de Envio

### Configuração Google Apps Script
Para salvar dados na planilha, é necessário criar um Google Apps Script:

1. Abra a planilha no Google Sheets
2. Vá em **Extensões** → **Apps Script**
3. Crie um arquivo `Code.gs` com o seguinte conteúdo:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheetName);
  
  if (action === 'saveOP') {
    return saveOP(sheet, data.op);
  } else if (action === 'getAllOPs') {
    return getAllOPs(sheet);
  } else if (action === 'getLastOPNumber') {
    return getLastOPNumber(sheet);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Ação inválida' }));
}

function saveOP(sheet, op) {
  try {
    const row = [
      op.numero,
      op.data,
      op.itens.map(i => i.itemName).join(', '),
      op.itens.reduce((sum, i) => sum + i.qtdCones, 0),
      op.itens.reduce((sum, i) => sum + i.qtdRocas, 0),
      op.itens.reduce((sum, i) => sum + i.pesoTotal, 0).toFixed(2),
      new Date().toISOString()
    ];
    
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: { numero: op.numero } }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }));
  }
}

function getAllOPs(sheet) {
  const data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }));
}

function getLastOPNumber(sheet) {
  const data = sheet.getDataRange().getValues();
  const numbers = data.slice(1).map(row => parseInt(row[0])).filter(n => !isNaN(n));
  const lastNumber = Math.max(0, ...numbers);
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: lastNumber }));
}
```

4. Implante como aplicativo Web:
   - Clique em **Implantar** → **Nova implantação**
   - Tipo: **Aplicativo web**
   - Executar como: Sua conta
   - Quem tem acesso: Qualquer pessoa
   - Copie a URL da aplicação Web e coloque em `VITE_GOOGLE_SCRIPT_URL`

### Autorização
A primeira vez que usar a integração, o Google pedirá autorizações. Aceite para prosseguir.

## 📱 Responsividade

A aplicação é totalmente responsiva:
- **Desktop**: Interface completa com todas as funcionalidades
- **Tablet**: Layout adaptado com tabs compactas
- **Mobile**: Cards em lugar de tabelas, scroll horizontal suave

## 🎨 Customização

### Cores do Tema
Edite `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#sua-cor',
      success: '#sua-cor',
      danger: '#sua-cor',
      warning: '#sua-cor',
    }
  }
}
```

### Cálculos e Fórmulas
Edite `src/utils/helpers.js` para modificar:
- `calculateQtdRocas()` - Fórmula de cálculo de rocas
- `calculatePesoTotal()` - Cálculo de peso

## 🌐 Deploy no Netlify

### Opção 1: Conectar GitHub (Recomendado)
1. Faça push do código para GitHub
2. Acesse [Netlify](https://netlify.com)
3. Clique em **New site from Git**
4. Selecione seu repositório
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Adicione variáveis de ambiente em **Site settings** → **Build & deploy** → **Environment**
7. Clique em **Deploy**

### Opção 2: Deploy Manual
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## 🔐 Segurança

- Configurações armazenadas **localmente** (localStorage) - Não sincronizam com servidor
- Dados de OP enviados para Google Sheets apenas após confirmação explícita
- API keys no `.env.local` não fazem commit (`.gitignore`)
- Validação de entrada em todos os formulários

## 🐛 Troubleshooting

### Erro: "Não foi possível buscar o último ID"
- Verifique se o Google Apps Script foi implantado corretamente
- Copie a URL correta em `VITE_GOOGLE_SCRIPT_URL`
- Verifique as permissões da planilha

### Erro: "Erro ao gerar PDF"
- Verifique se o navegador permite pop-ups
- Tente em um navegador diferente
- Limpe o cache do navegador

### Dados não persistem ao recarregar
- Verifique se `localStorage` está habilitado no navegador
- Limpe cookies e cache se necessário

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Gerador de OP com cálculos automáticos
- ✅ CRUD de itens (Configurações)
- ✅ Integração Google Sheets
- ✅ Geração de PDF para impressão
- ✅ Design responsivo completo
- ✅ Validação de estado sujo

## 📞 Suporte

Para problemas com:
- **Google Sheets API**: [Documentação oficial](https://developers.google.com/sheets/api)
- **Netlify**: [Docs Netlify](https://docs.netlify.com)
- **React/Vite**: [Vite Docs](https://vitejs.dev)

## 📄 Licença

Projeto desenvolvido em 2024. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando React + Vite + Tailwind CSS**
