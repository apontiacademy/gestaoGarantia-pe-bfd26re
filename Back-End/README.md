Como rodar o projeto localmente
1. Instale as dependências no terminal do projeto:
cd Back-End
npm install

2. Configure as variáveis de ambiente:
Copie o arquivo .env.example e renomeie para .env.

Ajuste as credenciais de DB_USER e DB_PASS conforme a sua instalação local do PostgreSQL.

3. Prepare o banco de dados:
O Sequelize criará o banco e as tabelas (quando houver migrations) para você:

npx sequelize-cli db:create
npx sequelize-cli db:migrate

4. Inicie o servidor:
npm run dev