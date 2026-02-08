# Guia de Deployment no Netlify

## 🚀 Deployment Automático via GitHub

### Pré-requisitos
- Repositório GitHub criado
- Conta Netlify gratuita ou paga
- Código commited no GitHub

### Passos

#### 1. Preparar o Repositório
```bash
# Inicializar git (se não feito)
git init
git add .
git commit -m "Initial commit: Sistema OP"
git branch -M main
git remote add origin https://github.com/seu-usuario/sistemop.git
git push -u origin main
```

#### 2. Conectar ao Netlify
1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Selecione GitHub como provedor
4. Autorize o Netlify no GitHub
5. Selecione o repositório `sistemop`

#### 3. Configurar Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### 4. Variáveis de Ambiente
No painel Netlify:
1. Vá para **Site settings** → **Build & deploy** → **Environment**
2. Clique em **Edit variables**
3. Adicione:
   ```
   VITE_GOOGLE_SHEETS_API_KEY = sua_api_key
   VITE_GOOGLE_SCRIPT_URL = seu_google_script_url
   ```

#### 5. Deploy
Clique em "Deploy site" ou simplesmente faça push para main:
```bash
git push origin main
```

Netlify vai fazer deploy automaticamente!

## ✅ Verificar Deployment

1. Acesse a URL gerada: `https://sua-app.netlify.app`
2. Teste as funcionalidades:
   - Adicionar itens em Configurações
   - Criar uma OP
   - Salvar na planilha
   - Gerar PDF

## 🔗 Custom Domain

1. Em **Domain settings**, clique em "Add domain"
2. Aponte seu domínio para Netlify (via CNAME)
3. Configure HTTPS automático (Let's Encrypt)

## 📊 Monitoramento

- **Build logs**: Site settings → Deploys
- **Performance**: Analytics & deploys → Bandwidth
- **Errors**: Functions → View error logs

## 🔄 Atualizações Automáticas

Toda vez que você fazer merge em `main`, Netlify faz build e deploy automaticamente!

## 🆘 Troubleshooting

### Build falha
```
Error: npm ERR! code ERESOLVE
```
- Execute localmente: `npm ci` (ao invés de `npm install`)
- Verifique `package.json` e `package-lock.json`

### Variáveis de ambiente não funcionam
- Certifique que estão em **Build & deploy** → **Environment**
- Redeploy após adicionar: **Deploys** → **Trigger deploy** → **Deploy site**

### PDF não gera
- Verifique permissão de contexto (CORS pode ser necessário)
- Use HTTPS na produção

---

**Dúvidas?** Veja [Netlify Docs](https://docs.netlify.com)
