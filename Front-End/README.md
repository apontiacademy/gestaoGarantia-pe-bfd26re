# Front-end — Gestão de Garantia

Aplicação web em **React + TypeScript + Vite** do sistema Gestão de Garantia.

**Deploy:** [https://gerenciador-de-garantia-aponti.netlify.app/](https://gerenciador-de-garantia-aponti.netlify.app/)

Documentação completa do projeto: [README na raiz](../README.md)

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

Sobe frontend, backend e PostgreSQL juntos. Execute os comandos **na raiz do repositório** (não dentro de `Front-End`).

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

Troque `JWT_SECRET` e `BREVO_API_KEY` por valores reais. O `BREVO_API_KEY` é usado pelo backend para envio de e-mails.

### 2. Subir os containers

```bash
docker compose up --build
```

Na primeira execução, o Docker baixa as imagens e instala as dependências. O backend aplica as migrations automaticamente.

### 3. Acessar a aplicação

| Serviço   | URL                      |
|-----------|--------------------------|
| Front-end | http://localhost:5173    |
| API       | http://localhost:3000    |

### Comandos úteis

```bash
# Rodar em segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f frontend

# Parar e remover containers
docker compose down

# Parar e remover containers + volume do banco
docker compose down -v
```

O front-end no Docker já recebe `VITE_API_URL=http://localhost:3000`. Upload de imagens (Cloudinary) usa valores padrão no código; para personalizar, crie `Front-End/.env` com `VITE_CLOUDINARY_CLOUD_NAME` e `VITE_CLOUDINARY_UPLOAD_PRESET` e adicione as variáveis ao serviço `frontend` no `docker-compose.yml`.

---

## Desenvolvimento local (sem Docker)

Entre na pasta do front-end:

```bash
cd Front-End
npm install
```

Crie `.env` na pasta `Front-End`:

```env
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
```

O backend precisa estar rodando (local ou Docker). Veja [Back-End/README.md](../Back-End/README.md).

```bash
npm run dev
```

Acesse http://localhost:5173.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Análise ESLint |

---

## Estrutura principal

```
src/
├── Pages/           # Telas da aplicação
├── components/      # UI e componentes de domínio
├── contexts/        # Auth, Warranty, Notifications, Toast
├── services/        # API, auth, Cloudinary
├── utils/           # Formatação, validação, mappers
├── hooks/           # Hooks customizados
└── layout/          # Layouts compartilhados
```

---

## Deploy (Netlify)

- **Base directory:** `Front-End`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Redirects SPA:** `public/_redirects`
