# Créditos SPE

Aplicação web para visualização da ficha de créditos das obras do **Sistema Positivo de Ensino (SPE)**,
a partir de uma planilha de créditos em formato **Excel**.

Os créditos são organizados por:

- ano da coleção  
- segmento  
- série (quando aplicável)  
- volume  
- disciplina e área  

e exibidos em cartões com as principais informações de autoria, créditos gerais, créditos de imagens,
sons e música.

---

## Tecnologias utilizadas

- **React** (com **TypeScript**)
- **Vite** (ferramenta de build e desenvolvimento)
- **shadcn/ui** + **Radix UI** (componentes de interface, como selects e botões)
- **Tailwind CSS** e CSS tradicional (arquivo `src/App.css`) para estilização
- **xlsx** para leitura da planilha de créditos (`.xlsx`)

---

## Como funciona

1. A aplicação lê o arquivo `public/data/creditos.xlsx`, que contém pelo menos as abas:
   - **Geral**: créditos gerais, núcleos, conteúdo digital etc.
   - **Autorias**: créditos por disciplina, capítulos, mídias e campos adicionais.
2. Os dados da planilha são normalizados e agrupados no carregamento inicial da página.
3. O usuário seleciona:
   - **Ano da coleção**
   - **Segmento**
   - **Série** (quando existir para o segmento escolhido)
   - **Volume**
4. A partir desses filtros, a tela monta:
   - cartões por disciplina com autorias e créditos gerais;
   - blocos de créditos gerais por área (Núcleo de Arte, Conteúdo Educacional, Conteúdo Digital etc.);
   - seção específica para **Créditos – Sons e Música**.

---

## Como rodar o projeto localmente

### Pré-requisitos

- **Node.js** (versão recomendada: 18 ou superior)
- **npm** (instalado junto com o Node)

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/Luizsb/CreditosSPE.git
cd CreditosSPE

# 2. Instalar dependências
npm install

# 3. Rodar o servidor de desenvolvimento
npm run dev
```

Por padrão, a aplicação ficará disponível em um endereço semelhante a:

- `http://localhost:5173`

(a porta pode variar conforme sua configuração local do Vite).

---

## Estrutura principal do projeto

Alguns arquivos e pastas importantes:

- `src/pages/Index.tsx` – página principal da ficha de créditos, lógica de filtros e montagem dos cartões.  
- `src/App.css` – estilos específicos da página de créditos (layout, cartões, tipografia etc.).  
- `public/data/creditos.xlsx` – planilha fonte dos créditos (arquivo lido em tempo de execução).  
- `src/components/ui` – componentes de UI reutilizáveis (Select, Button, etc.).  

---

## Atualizando a planilha de créditos

Para atualizar os créditos exibidos pela aplicação:

1. Gere uma nova planilha seguindo o mesmo formato da atual (`creditos.xlsx`), respeitando:
   - nomes das abas (por exemplo: **Geral**, **Autorias**);
   - nomes das colunas utilizadas pelo código (ano, volume, segmento, série, disciplina, blocos de créditos etc.).
2. Substitua o arquivo:
   - `public/data/creditos.xlsx`
3. Rode novamente o projeto (`npm run dev`) ou faça uma nova build (`npm run build`) para disponibilizar a versão atualizada.

---

## Build para produção

Para gerar uma versão otimizada para produção:

```bash
npm run build
```

E, se quiser testar localmente a build gerada:

```bash
npm run preview
```

---

## Licença

Este repositório é de uso interno da Companhia Brasileira de Educação e Sistemas de Ensino S.A.
O conteúdo e os créditos exibidos pela aplicação são de propriedade da instituição.
