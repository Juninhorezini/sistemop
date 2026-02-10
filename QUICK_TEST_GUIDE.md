# 🧪 Teste Rápido do Google Apps Script

> Como testar seu Google Apps Script pelo console do navegador

---

## ⚠️ Importante

Substitua este valor antes de executar:
- `YOUR_SCRIPT_ID` → ID do seu Apps Script (da URL do deployment)

---

## 1️⃣ Teste de Conexão (Verificar se está funcionando)

Cole no console do navegador (F12 > Console):

```javascript
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
console.log('Resultado:', data);
```

**Resposta esperada:**
```javascript
{
  success: true,
  lastNumber: 123  // ou o último número de OP
}
```

**Se receber erro:**
- Verifique se a URL está correta
- Verifique se o token está correto
- Verifique se o Apps Script foi deployado

---

## 2️⃣ Buscar Todas as OPs

```javascript
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
console.log('OPs:', data.ops);
console.log('Quantidade:', data.count);
```

**Resposta esperada:**
```javascript
{
  success: true,
  ops: [
    {
      numero: 1,
      data: "2024-02-08",
      color: "Azul",
      itens: "Item A, Item B",
      qtdCones: 100,
      qtdRocas: 25,
      pesoTotal: 250,
      dataEnvio: "2024-02-08T10:30:00Z"
    }
  ],
  count: 1
}
```

---

## 3️⃣ Salvar Nova OP

```javascript
const response = await fetch(
  'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'saveOP',
      sheetName: 'OPs Produção',
      op: {
        numero: 999,
        data: '2026-02-09',
        color: 'Vermelho',
        itens: [
          {
            itemName: 'Teste Item',
            qtdCones: 50,
            qtdRocas: 13,
            pesoTotal: 130,
            pesoCone: 2.6,
            pesoRoca: 10.0
          }
        ]
      }
    })
  }
);
const data = await response.json();
console.log('Resultado:', data);
```

**Resposta esperada:**
```javascript
{
  success: true,
  numero: 999,
  mensagem: "OP salva com sucesso"
}
```

---

## 🔧 Como Obter a URL do Apps Script

1. Vá para seu projeto em [script.google.com](https://script.google.com)
2. Clique em **Implantar** > **Gerencie implantações**
3. Copie a URL (parecida com):
   ```
   https://script.google.com/macros/s/AKfycbzXxxx.../usercopy
   ```
4. Use `YOUR_SCRIPT_ID` como tudo entre `/s/` e `/usercopy`

---

## 📋 Checklist de Teste

- [ ] Teste 1: Conexão básica retorna `{ success: true }`
- [ ] Teste 2: Busca de OPs retorna array (pode estar vazio)
- [ ] Teste 3: Salvar OP adiciona dados à planilha

Se todos os testes passarem, seu Google Apps Script está funcionando corretamente! ✅

---

## 🐛 Troubleshooting

### Erro: "Cannot use import statement outside a module"
- Isso é normal no console do navegador
- Use `fetch()` em vez de `import`
- Veja os exemplos acima

### Erro: "Sheet não encontrada"
- Verifique o nome da aba: deve ser exatamente `"OPs Produção"`
- Respeite maiúsculas/minúsculas
- Verifique o ID da planilha no Apps Script

### Erro de CORS ou Network
- Verifique a URL completa está correta
- Verifique internet está funcionando
- Tente em navegador diferente

### Erro customizado do servidor
- Abra o histórico de execuções no Apps Script
- Procure pela execução mais recente
- Verifique os logs para mais detalhes

---

**Pronto para testar! 🚀**
