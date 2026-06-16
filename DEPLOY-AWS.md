# Deploy na AWS — Ficha de Créditos SPE

Este projeto é um **site estático** (HTML, CSS e JavaScript). Não precisa de servidor de aplicação (Node, PHP, etc.) — apenas hospedagem de arquivos estáticos.

---

## O que enviar para quem vai subir na AWS

Envie o conteúdo da pasta **`dist/`** (todos os arquivos e subpastas **dentro** de `dist`, não a pasta `dist` vazia por cima).

Estrutura esperada no bucket S3:

```
index.html
assets/
data/creditos.xlsx
icons/
logos/
partners/
```

> **Importante:** use o build para AWS (`npm run build:aws`), não o build padrão. O build padrão (`npm run build`) gera caminhos para GitHub Pages (`/CreditosSPE/`) e **não funciona** na raiz de um domínio na AWS.

---

## Como gerar a pasta `dist` correta para AWS

Na máquina de desenvolvimento, com Node.js 18+ instalado:

```bash
npm install
npm run build:aws
```

Para testar localmente antes de enviar:

```bash
npm run preview
```

Abra no navegador: **http://localhost:4173/**

> **Não abra o `index.html` com duplo clique.** Sites Vite/React precisam ser servidos por HTTP/HTTPS (`npm run preview`, S3, CloudFront, etc.). Abrir como `file://` gera tela branca e erro de CORS no console.

---

## Subindo na AWS (S3 + CloudFront)

### 1. Bucket S3

1. Crie um bucket (ex.: `creditos-spe-prod`).
2. Faça upload de **todo o conteúdo** de `dist/` para a **raiz** do bucket.
3. Em **Propriedades → Hospedagem de site estático**, habilite e defina `index.html` como documento de índice.
4. Em **Permissões**, libere leitura pública dos objetos (ou use CloudFront com OAC — recomendado em produção).

### 2. CloudFront (recomendado)

1. Crie uma distribuição com origem no bucket S3.
2. **Default root object:** `index.html`
3. Use HTTPS com certificado ACM.
4. Aponte o domínio (ex.: `creditos.empresa.com.br`) para a distribuição.

### 3. Conferir após o deploy

- A página carrega com título **"Ficha de Créditos"**
- Os filtros (ano, segmento, volume) aparecem
- O arquivo `data/creditos.xlsx` é acessível (ex.: `https://seu-dominio.com/data/creditos.xlsx`)

---

## Atualizar os dados dos créditos

1. Edite `public/data/creditos.xlsx` no projeto fonte (abas **Geral** e **Autorias**).
2. Rode `npm run build:aws` novamente.
3. Envie a nova pasta `dist/` para a AWS (substituindo os arquivos no bucket).

---

## Resumo

| Pergunta | Resposta |
|----------|----------|
| Enviar o quê? | Conteúdo da pasta `dist/` (build com `npm run build:aws`) |
| Precisa de Node na AWS? | Não — só na hora de gerar o build |
| Abrir `index.html` direto funciona? | Não |
| Build na raiz do domínio? | `npm run build:aws` |
| Build para GitHub Pages? | `npm run build` |

---

## Repositório fonte

Código completo: https://github.com/Luizsb/CreditosSPE.git

Para alterações de layout ou lógica, clone o repositório, edite o código em `src/` e gere um novo build.
