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

> **Importante:** o comando de build deve corresponder ao **caminho (URL)** onde o site ficará hospedado.

| URL de publicação | Comando de build |
|-------------------|------------------|
| `https://dominio.com/` (raiz) | `npm run build:aws` |
| `https://digital.sistemapositivo.com.br/CREDITOS25/` | `npm run build:creditos25` |
| GitHub Pages (`/CreditosSPE/`) | `npm run build` |

O build errado gera tela branca e erros **404** no console para arquivos em `/assets/`.

---

## Como gerar a pasta `dist` correta para AWS

Na máquina de desenvolvimento, com Node.js 18+ instalado:

```bash
npm install
npm run build:creditos25
```

Para o ambiente Positivo (`/CREDITOS25/`), use **`build:creditos25`**.  
Para a raiz do domínio, use **`build:aws`**.

Para testar localmente antes de enviar:

```bash
npm run build:creditos25
npm run preview
```

Abra no navegador: **http://localhost:4173/CREDITOS25/**

> **Não abra o `index.html` com duplo clique.** Sites Vite/React precisam ser servidos por HTTP/HTTPS (`npm run preview`, S3, CloudFront, etc.). Abrir como `file://` gera tela branca e erro de CORS no console.

---

## Subindo na AWS (S3 + CloudFront)

### 1. Bucket S3

1. Crie ou use o bucket existente.
2. Faça upload de **todo o conteúdo** de `dist/` na pasta/prefixo **`CREDITOS25/`** do bucket (não na raiz, se a URL for `.../CREDITOS25/`).
3. Estrutura no S3:

```
CREDITOS25/index.html
CREDITOS25/assets/...
CREDITOS25/data/creditos.xlsx
CREDITOS25/icons/...
CREDITOS25/logos/...
CREDITOS25/partners/...
```

4. Em **Propriedades → Hospedagem de site estático**, habilite e defina `index.html` como documento de índice.
5. Em **Permissões**, libere leitura pública dos objetos (ou use CloudFront com OAC — recomendado em produção).

### 2. CloudFront (recomendado)

1. Crie uma distribuição com origem no bucket S3.
2. **Default root object:** `index.html`
3. Use HTTPS com certificado ACM.
4. Aponte o domínio (ex.: `creditos.empresa.com.br`) para a distribuição.

### 3. Conferir após o deploy

- A página carrega com título **"Ficha de Créditos"**
- Os filtros (ano, segmento, volume) aparecem
- O arquivo `data/creditos.xlsx` é acessível (ex.: `https://digital.sistemapositivo.com.br/CREDITOS25/data/creditos.xlsx`)

---

## Atualizar os dados dos créditos

1. Edite `public/data/creditos.xlsx` no projeto fonte (abas **Geral** e **Autorias**).
2. Rode o build correspondente à URL (`npm run build:creditos25` ou `npm run build:aws`).
3. Envie a nova pasta `dist/` para a AWS (substituindo os arquivos no bucket).

---

## Resumo

| Pergunta | Resposta |
|----------|----------|
| Enviar o quê? | Conteúdo da pasta `dist/` (com o build da URL correta) |
| Precisa de Node na AWS? | Não — só na hora de gerar o build |
| Abrir `index.html` direto funciona? | Não |
| URL `.../CREDITOS25/` | `npm run build:creditos25` |
| Build na raiz do domínio? | `npm run build:aws` |
| Build para GitHub Pages? | `npm run build` |

---

## Repositório fonte

Código completo: https://github.com/Luizsb/CreditosSPE.git

Para alterações de layout ou lógica, clone o repositório, edite o código em `src/` e gere um novo build.
