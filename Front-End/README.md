# Front-end — Gestão de Garantia

Aplicação web em **React + TypeScript + Vite** do sistema Gestão de Garantia.

**Deploy:** [https://gerenciador-de-garantia-aponti.netlify.app/](https://gerenciador-de-garantia-aponti.netlify.app/)

Documentação completa do projeto: [README na raiz](../README.md)

---

## Início rápido

```bash
npm install
```

Crie `.env` na pasta `Front-End`:

```env
VITE_API_URL=http://localhost:3000 ou URL onde estra hospedado a API
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset
```

```bash
npm run dev
```

Acesse `http://localhost:5173`.

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
