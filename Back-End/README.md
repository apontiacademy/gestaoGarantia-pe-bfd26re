# Backend

Este diretório contém o backend da aplicação de gestão de garantia, construído com Node.js, Express e Sequelize para PostgreSQL.

## Requisitos

- Node.js (recomendado >= 18)
- npm (vem com o Node.js)
- PostgreSQL instalado e em execução

## Instalação

No terminal, a partir da raiz do projeto ou direto no diretório `Back-End`:

```bash
cd Back-End
npm install
```

## Configuração de ambiente

Crie um arquivo `.env` na pasta `Back-End` com os dados do seu banco de dados e as chaves necessárias.

Exemplo de variáveis necessárias:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nome_do_banco
DB_USER=seu_usuario
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta
```

Ajuste `DB_NAME`, `DB_USER` e `DB_PASS` conforme a sua instalação local do PostgreSQL.
No "JWT_SECRET" você vai criar uma chave secreta, e usará ela para requisições que exigem autenticação, exemplo: Login.

## Banco de dados

Execute os comandos abaixo para criar o banco e aplicar as migrations:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

Se precisar, verifique os arquivos de migration em `src/migrations`.

## Executar o backend

Para rodar o servidor em modo de desenvolvimento com reinício automático (recomendável):

```bash
npm run dev
```

Para rodar sem `nodemon` (sem reinício automático):

```bash
npm start
```

## Observações

- O servidor principal está em `src/app.js`.
- Se houver erro de conexão, verifique as variáveis no `.env` e se o PostgreSQL está ativo.
- Se a aplicação usar outros arquivos de configuração, revise `src/config/config.js`.
