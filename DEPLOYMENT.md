# 🚀 Guia de Deploy - Sofia ASOF

Este documento descreve como fazer o deploy da aplicação Sofia (Assistente Virtual ASOF) na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Chave de API do Google Gemini ([obter aqui](https://aistudio.google.com/app/apikey))
- Git instalado
- Node.js 18+ instalado

## 🔧 Configuração Inicial

### 1. Preparar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Chave da API Gemini
GEMINI_API_KEY=sua_chave_api_aqui
```

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env.local`
- Use o `.env.example` como referência
- A chave deve ter restrições de domínio no Google Cloud Console

### 2. Instalar Dependências

```bash
npm install
```

### 3. Testar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 🌐 Deploy na Vercel

### Opção 1: Deploy via CLI (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login na Vercel:**
```bash
vercel login
```

3. **Deploy de Preview:**
```bash
vercel
```

4. **Deploy de Produção:**
```bash
vercel --prod
```

### Opção 2: Deploy via GitHub

1. **Conectar Repositório:**
   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Clique em "New Project"
   - Importe o repositório do GitHub

2. **Configurar Build:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Configurar Variáveis de Ambiente:**
   - Vá em "Settings" > "Environment Variables"
   - Adicione: `GEMINI_API_KEY` com sua chave

4. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar

## 🔒 Segurança e Configurações

### Headers de Segurança

A aplicação já está configurada com headers de segurança em `vercel.json`:

- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- ✅ Cache otimizado para assets estáticos (31536000s)

### Restrições de API Key

**Configure restrições na Google Cloud Console:**

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em "APIs & Services" > "Credentials"
3. Selecione sua API key
4. Adicione restrições:
   - **Application restrictions:** HTTP referrers
   - Adicione: `https://seu-dominio.vercel.app/*`
   - Adicione: `http://localhost:3000/*` (para dev)

## 📊 Monitoramento e Performance

### Métricas Importantes

Após o deploy, monitore:

- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s ✅
  - FID (First Input Delay): < 100ms ✅
  - CLS (Cumulative Layout Shift): < 0.1 ✅

- **Build Size:**
  - Vendor bundle: ~141KB (gzip: ~45KB)
  - App bundle: ~64KB (gzip: ~18KB)
  - Icons: ~15KB (gzip: ~3.7KB)

### Analytics (Opcional)

Para adicionar analytics da Vercel:

```bash
npm install @vercel/analytics
```

Em `App.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* seu app */}
      <Analytics />
    </>
  );
}
```

## 🔄 Processo de Atualização

### Deploy de Nova Versão

1. **Fazer alterações no código**
2. **Testar localmente:**
   ```bash
   npm run build
   npm run preview
   ```
3. **Commit e push:**
   ```bash
   git add .
   git commit -m "feat: descrição das mudanças"
   git push origin main
   ```
4. **Vercel fará deploy automático** (se conectado via GitHub)

### Rollback

Se algo der errado:

```bash
# Listar deployments
vercel list

# Fazer rollback para deployment anterior
vercel rollback [deployment-url]
```

## 🐛 Troubleshooting

### Build Falha

**Erro: "Cannot find module"**
- Solução: `rm -rf node_modules && npm install`

**Erro: TypeScript errors**
- Solução: Verifique `tsconfig.json` e rode `npm run build` localmente

### Runtime Errors

**Erro: "API key not found"**
- Verifique se `GEMINI_API_KEY` está configurada na Vercel
- Vá em Settings > Environment Variables

**Erro: CORS**
- Verifique restrições da API key no Google Cloud
- Adicione o domínio Vercel nas restrições

## 📝 Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Testei a aplicação localmente (`npm run dev`)
- [ ] Build de produção passou (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] API key tem restrições de domínio
- [ ] Headers de segurança estão ativos
- [ ] `.env.local` **NÃO** está no Git
- [ ] Documentação atualizada

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Docs](https://ai.google.dev/docs)

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma issue no repositório
- Contate a equipe de desenvolvimento ASOF
