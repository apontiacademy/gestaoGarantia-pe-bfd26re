# Backend — Gestão de Garantia

API REST em **Node.js + Express + Sequelize** com PostgreSQL.

Documentação do front-end: [Front-End/README.md](../Front-End/README.md)

---

## Baixar o repositório

Pré-requisitos: [Git](https://git-scm.com/downloads) instalado.

```bash
git clone https://github.com/apontiacademy/gestaoGarantia-pe-bfd26re.git
cd gestaoGarantia-pe-bfd26re
```

Sem Git, baixe o ZIP em [github.com/apontiacademy/gestaoGarantia-pe-bfd26re](https://github.com/apontiacademy/gestaoGarantia-pe-bfd26re) e extraia a pasta.

---

## Rodar com Docker (recomendado)

Sobe backend, front-end e PostgreSQL juntos. Execute os comandos **na raiz do repositório** (não dentro de `Back-End`).

**Pré-requisitos:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) ou Docker Engine + Compose (Linux).

### 1. Criar o arquivo `.env` na raiz

Na pasta `gestaoGarantia-pe-bfd26re`, crie um arquivo `.env`:

```env
DB_USER=postgres
DB_PASS=postgres
DB_NAME=garantias
JWT_SECRET=sua_chave_secreta_aqui
CORS_ORIGIN=http://localhost:5173
BREVO_API_KEY=sua_chave_brevo
```

| Variável       | Descrição |
|----------------|-----------|
| `DB_USER`      | Usuário do PostgreSQL no container |
| `DB_PASS`      | Senha do PostgreSQL |
| `DB_NAME`      | Nome do banco de dados |
| `JWT_SECRET`   | Chave para assinar tokens JWT (login e rotas autenticadas) |
| `CORS_ORIGIN`  | Origem permitida do front-end (separe várias URLs com vírgula) |
| `BREVO_API_KEY`| Chave da API Brevo para envio de e-mails |

### 2. Subir os containers

```bash
docker compose up --build
```

O serviço `backend` aguarda o PostgreSQL ficar saudável, roda `db:migrate` e inicia o servidor com hot-reload. O código em `Back-End/src` é montado como volume — alterações locais refletem no container.

### 3. Acessar

| Serviço   | URL                      |
|-----------|--------------------------|
| API       | http://localhost:3000    |
| Front-end | http://localhost:5173    |
| PostgreSQL| `localhost:5433` (host) → porta `5432` no container |

### Comandos úteis

```bash
# Rodar em segundo plano
docker compose up -d --build

# Ver logs do backend
docker compose logs -f backend

# Rodar migrations manualmente (se necessário)
docker compose exec backend npx sequelize-cli db:migrate

# Abrir shell no container do backend
docker compose exec backend sh

# Parar containers
docker compose down

# Parar e apagar dados do banco
docker compose down -v
```

---

## Desenvolvimento local (sem Docker)

### Requisitos

- Node.js >= 18
- npm
- PostgreSQL instalado e em execução

### Instalação

```bash
cd Back-End
npm install
```

### Configuração

Crie `Back-End/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garantias
DB_USER=seu_usuario
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:5173
BREVO_API_KEY=sua_chave_brevo
```

### Banco de dados

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

Migrations ficam em `src/migrations`.

### Executar

```bash
npm run dev
```

Modo produção (sem reinício automático):

```bash
npm start
```

A API fica em http://localhost:3000. Suba o front-end separadamente — veja [Front-End/README.md](../Front-End/README.md).

---

## Observações

- Ponto de entrada: `src/app.js`
- Configuração do Sequelize: `src/config/config.js`
- Erro de conexão: confira `.env` e se o PostgreSQL está ativo (local) ou se o container `db` está saudável (Docker)
