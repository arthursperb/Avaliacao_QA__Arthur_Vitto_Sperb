# Avaliação QA - Arthur Vitto Sperb

Testes end-to-end desenvolvidos com [Playwright](https://playwright.dev/) (JavaScript) para validação do card de ajustes na impressão de informações de grade durante a emissão de NF-e.

## Sobre os testes

O projeto contém dois testes :

1. **Emissão de NF-e com item já cadastrado no estoque** — valida o fluxo correto: a variação da grade é preservada da tela até o XML transmitido.
2. **Emissão de NF-e com item cadastrado diretamente na nota** — reproduz um bug conhecido: quando o item é cadastrado na mesma operação da NF-e, a variação da grade não é composta no XML gerado. **Este teste falha propositalmente** enquanto o bug não for corrigido pelo time de desenvolvimento — assim que a correção for aplicada, ele passa a ser aprovado automaticamente.

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (recomendado v18 ou superior)
- Acesso ao ambiente de staging fornecido para a avaliação

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/arthursperb/Avaliacao_QA__Arthur_Vitto_Sperb.git
cd Avaliacao_QA__Arthur_Vitto_Sperb
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Instalar os navegadores do Playwright

```bash
npx playwright install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, copiando o modelo fornecido:

```bash
cp .env.example .env
```

Em seguida, edite o `.env` e preencha com as credenciais do ambiente de staging:


> O arquivo `.env` nunca é versionado (está no `.gitignore`) — apenas o `.env.example`, como referência de quais variáveis são necessárias.

### 5. Rodar os testes

Teste 1 - Emitindo NF-e, com item que possui grade previamente cadastrado:
```bash
npx playwright test -g "Emissão de NF-e com item que possui Grade previamente cadastrado"
```

Teste 2 - Emitindo NF-e, cadastrando item com grade jé dentro da NF-e
```bash
npx playwright test -g "Emissão de NF-e com item de grade cadastrado diretamente na nota"
```

Caso deseje acompanhar os testes em tempo real, adicione ao final do comando:
```bash
--headed
```

## Estrutura do projeto

```
├── tests/
│   └── test.spec.js         # Testes E2E
├── utils/
│   ├── login.js              # Função de login reutilizável
│   ├── logout.js              # Função de logout reutilizável
│   └── cadastroItem.js       # Função de cadastro de item com grade no estoque
├── playwright.config.js       # Configuração do Playwright (viewport, projetos, etc.)
├── .env.example                # Modelo de variáveis de ambiente
└── package.json
```

## Observações importantes

- Os testes rodam contra o ambiente de **staging/homologação** e criam dados reais nesse ambiente (produtos, NF-e). Não devem ser executados em produção.
- Os produtos cadastrados pelos testes usam nomes dinâmicos com timestamp (ex: `Camisa Teste 1786336944429`), evitando duplicidade entre execuções.
- O segundo teste (item cadastrado diretamente na nota) é **esperado que falhe** até a correção do bug relacionado à composição da grade no XML — ver documento de avaliação para detalhes completos da investigação.
