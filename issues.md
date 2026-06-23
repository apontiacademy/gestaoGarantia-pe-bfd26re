 Análise do Sistema: Gestão de Garantia

 Context

 Sistema de gestão de garantias (Aponti) com Backend Node.js/Express + Sequelize (PostgreSQL) e Frontend React 19 + TypeScript + Vite. O objetivo é mapear todos os problemas críticos, inconsistências de tipos ponta a ponta, pontos cegos
 de isolamento de dados entre usuários, e avaliar o estado real de deployment readiness.

 ---
 Estrutura do Projeto

 gestaoGarantia-pe-bfd26re/
 ├── Back-End/              # Node.js + Express + Sequelize
 │   └── src/
 │       ├── app.js
 │       ├── config/config.js
 │       ├── controllers/   # Garantia, GarantiaEstendida, loginAuth, RegisterEquipments, RegisterUser
 │       ├── middlewares/authToken.js
 │       ├── migrations/    # 10 migrações
 │       ├── models/        # 11 modelos
 │       ├── routes/        # auth, equipment, garantia, user
 │       └── utils/
 └── Front-End/             # React 19 + TypeScript + Vite
     └── src/
         ├── services/      # api.ts, authService.ts, warrantyService.ts
         ├── contexts/      # AuthContext, WarrantyContext
         ├── Pages/         # 11 páginas
         └── utils/

 A estrutura de pastas é razoável, mas tem gaps importantes:
 - Sem pasta types/ compartilhada entre frontend e backend
 - Sem camada de service entre controller e model no backend
 - Sem pasta validators/ (validações espalhadas nos controllers)

 ---
 Arquitetura de Dados: Visitante vs. Usuário Logado

 O design intencional do sistema prevê dois modos:

 ┌─────────────┬────────────────┬──────────────────────────┬────────────────────────────────────────┐
 │    Modo     │      Quem      │   Onde os dados ficam    │                Páginas                 │
 ├─────────────┼────────────────┼──────────────────────────┼────────────────────────────────────────┤
 │ Visitante   │ Sem login      │ localStorage do browser  │ /home-demo, /lixeira                   │
 ├─────────────┼────────────────┼──────────────────────────┼────────────────────────────────────────┤
 │ Autenticado │ Usuário logado │ Backend API + PostgreSQL │ /home, /create-warranty, /garantia/:id │
 └─────────────┴────────────────┴──────────────────────────┴────────────────────────────────────────┘

 O problema central: o WarrantyContext não distingue esses dois modos. Ele sempre chama warrantyService.ts (localStorage), independente de o usuário estar logado ou não. Quando autenticado, as garantias deveriam ir e vir da API — e não
 chegam. Isso é o maior gap funcional do sistema.

 ---
 Problema mais crítico: WarrantyContext não é auth-aware

 Front-End/src/contexts/WarrantyContext.tsx importa diretamente de warrantyService.ts (localStorage) e nunca lê AuthContext. Quando o usuário faz login, nada muda no comportamento — dados continuam no browser, nunca chegam ao banco.

 A correção arquitetural necessária é tornar o WarrantyContext aware do estado de autenticação:
 - isAuthenticated === false → todas as operações usam warrantyService.ts (localStorage, comportamento de visitante)
 - isAuthenticated === true → todas as operações usam chamadas HTTP para a API (backend)

 Além disso, é uma ponta solta crítica: o que acontece com as garantias do localStorage quando o visitante faz login? Elas devem ser migradas para o backend, descartadas, ou o usuário deve ser avisado?

 ---
 Inconsistência de Tipos Ponta a Ponta

 O shape dos dados do frontend e do backend é incompatível. Um campo do frontend pode corresponder a múltiplas tabelas do backend.

 ┌───────────────────────────────┬────────────────────────────────────────────────────────┬────────────────────────────────────────┐
 │   Campo Frontend (Warranty)   │                     Tabela Backend                     │             Campo Backend              │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ id (string UUID)              │ Garantias                                              │ id (INTEGER autoincrement)             │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ title (nome + marca + modelo) │ Produtos                                               │ nome, marca, modelo (campos separados) │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ purchaseDate                  │ Documentos_Fiscais                                     │ data_compra                            │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ value                         │ Documentos_Fiscais                                     │ valor (DECIMAL)                        │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ nfNumber                      │ Documentos_Fiscais                                     │ numero_nf                              │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ storeCnpj                     │ Documentos_Fiscais                                     │ cnpj_fornecedor                        │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ warrantyType                  │ Garantias                                              │ tipo                                   │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ notes                         │ Garantias                                              │ observacao                             │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ expirationDate                │ Garantias                                              │ data_fim (calculado)                   │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ deletedAt                     │ Garantias                                              │ deletado_em                            │
 ├───────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────┤
 │ attachments[]                 │ Arquivo_Documento + Documento_Fiscal_Arquivo_Documento │ sem campo de URL/path                  │
 └───────────────────────────────┴────────────────────────────────────────────────────────┴────────────────────────────────────────┘

 Consequências:
 1. O backend precisará de um endpoint que retorne a visão "achatada" da garantia (join de Garantia + Produto + Documento_Fiscal), ou o frontend precisará fazer múltiplas chamadas e montar o objeto.
 2. O id frontend é string (UUID gerado via crypto.randomUUID()); o backend usa INTEGER autoincrement — ao integrar, o tipo de id do Warranty muda.
 3. O campo title do frontend é um string composto (nome + marca + modelo); no backend são campos separados em Produtos. O utilitário buildWarrantyTitle() precisa de inversa (split) ao ler do banco.
 4. value no frontend é string; no backend é DECIMAL(10,2) — conversão necessária.

 ---
 PRIORIDADE 1 — Bloqueadores de Deploy (Sistema não inicia ou quebra na primeira requisição)

 1. WarrantyContext ignora autenticação — dados nunca chegam ao backend

 - Arquivo: Front-End/src/contexts/WarrantyContext.tsx
 - Problema: Nunca consome AuthContext. Sempre usa localStorage.
 - Fix: Injetar useAuth() no WarrantyContext; quando isAuthenticated === true, trocar todas as operações por chamadas à API.
 - Ponta solta a definir: o que fazer com dados do localStorage quando o visitante faz login?

 2. VITE_API_URL indefinida — chamadas HTTP falham silenciosamente

 - Arquivo: Front-End/src/services/api.ts linha 1
 - Problema: import.meta.env.VITE_API_URL é undefined sem arquivo .env.
 - Fix: Criar Front-End/.env com VITE_API_URL=http://localhost:3000 e Front-End/.env.production para deploy.

 3. Variável SECRET_KEY não definida no middleware de auth

 - Arquivo: Back-End/src/middlewares/authToken.js linha 11
 - Problema: jwt.verify(token, SECRET_KEY, ...) — SECRET_KEY não existe; deveria ser process.env.JWT_SECRET.
 - Impacto: Qualquer rota que importar este middleware crasha ao ser carregada.

 4. Bug de nome de variável — GarantiaEstendida lança TypeError em toda requisição

 - Arquivo: Back-End/src/controllers/GarantiaEstendida.js linhas 2, 24, 40, 59, 90, 95, 116
 - Problema: Importa o model como garantia_estendida (minúsculo), mas o modelo Sequelize é Garantia_Estendida. garantia_estendida.create(...) lança TypeError: garantia_estendida is not a constructor.
 - Fix: Renomear todas as ocorrências para Garantia_Estendida.

 5. Dupla chave primária derruba o Sequelize na inicialização

 - Arquivo: Back-End/src/models/documento_fiscal.js linhas 13-22
 - Problema: Dois campos com primaryKey: true (id e produto_id). Sequelize rejeita no sync/query.
 - Fix: Remover primaryKey: true de produto_id — ele é apenas FK.

 6. Usuario não importado em auth.routes.js — rota /auth/profile crasha

 - Arquivo: Back-End/src/routes/auth.routes.js linhas 29-48
 - Problema: await Usuario.findByPk(userId) sem o model importado → ReferenceError.
 - Fix: Adicionar const { Usuario } = require('../models');.

 7. process.exit(1) comentado — servidor sobe sem JWT_SECRET

 - Arquivo: Back-End/src/app.js
 - Problema: Validação de variáveis obrigatórias existe mas process.exit(1) está comentado. O servidor inicia e falha apenas na primeira requisição que precisar de JWT.
 - Fix: Descomentar o process.exit(1).

 8. Coluna status referenciada em controller mas ausente na migration de Produto

 - Arquivo: Back-End/src/controllers/RegisterEquipments.js linha 81
 - Problema: produto.update({ status }) — campo status não existe na migration create-produto. Gera erro SQL em produção.
 - Fix: Adicionar coluna status à migration de Produto.

 ---
 PRIORIDADE 2 — Integridade de Dados e Tipos Inconsistentes

 9. Nome de coluna divergente entre migration e model: id_usuario vs usuario_id

 - Migration: 20260513125312-create-notificacoes.js cria coluna id_usuario
 - Model: notificacao.js espera FK usuario_id
 - Impacto: Associações Sequelize quebram; JOINs retornam null.

 10. WHERE clause errada em update/delete de GarantiaEstendida

 - Arquivo: Back-End/src/controllers/GarantiaEstendida.js linhas 100, 117
 - Problema: where: { id_garantia_estendida: id } — o PK real da tabela é id.
 - Impacto: Update e delete executam sem afetar nenhuma linha (0 rows affected, sem erro visível).

 11. Tipo de retorno errado no register() do frontend

 - Arquivo: Front-End/src/services/authService.ts linha 15
 - Problema: api.post<RegisterPayload>(...) — deveria ser api.post<AuthResponse>(...). O AuthContext nunca é populado após cadastro.

 12. Constraint CHECK com sintaxe inválida na migration

 - Arquivo: Back-End/src/migrations/20260512165704-create-documento-fiscal.js
 - Problema: addConstraint com type: 'check' usa campo where (inválido); a opção correta é expression. Esta migration falha ao rodar.

 13. deletado_por sempre hardcoded como 'sistema'

 - Arquivo: Back-End/src/controllers/Garantia.js
 - Problema: Soft-delete registra o autor como 'sistema' em vez do usuário do token.
 - Fix: Usar req.user.id_usuario no campo.

 14. Arquivo_Documento sem campo de URL ou path do arquivo

 - Arquivo: Back-End/src/models/arquivo_documento.js
 - Problema: Modelo tem apenas origem e data_upload. Não há como recuperar o arquivo após upload. O frontend armazena arquivos como base64 no localStorage (infla 33% o tamanho e esgota a cota do browser).
 - Fix: Adicionar campos url, nome_arquivo, mime_type, tamanho_bytes ao modelo e migration; implementar endpoint de upload com storage (S3, Supabase Storage, etc.).

 ---
 PRIORIDADE 3 — Segurança

 15. Middleware de auth duplicado em 4 arquivos de rotas

 - Arquivos: auth.routes.js, equipment.routes.js, garantia.routes.js, user.routes.js
 - Problema: Cada arquivo define sua própria autenticarToken inline. Inconsistência já existe: alguns populam req.user, outros req.usuario. Correção de segurança precisa ser feita em 4 lugares.
 - Fix: Usar o middleware centralizado de authToken.js (após corrigir item 3) em todos os routers.

 16. Console.log expondo payload do JWT decodificado em produção

 - Arquivo: Back-End/src/middlewares/authToken.js
 - Fix: Remover console.log("decoded token:", usuario).

 17. Console.log de debug em ForgotPassword (informação do reset em log)

 - Arquivo: Front-End/src/Pages/ForgotPassword.tsx linhas 81-95
 - Fix: Remover todos os console.log antes do deploy.

 18. CORS hardcoded no código-fonte

 - Arquivo: Back-End/src/app.js
 - Problema: URLs do frontend fixas no código. Deve vir de process.env.CORS_ORIGIN.

 19. Sem validação de expiração do token JWT no frontend

 - Arquivo: Front-End/src/contexts/AuthContext.tsx
 - Problema: Token expirado continua sendo enviado nas requisições. Nenhum interceptor checa a validade.
 - Fix: Decodificar o JWT no cliente ao fazer login (sem verificar assinatura), checar exp ao inicializar o AuthContext; se expirado, limpar a sessão.

 20. Sem validação de senha no registro de usuário

 - Arquivo: Back-End/src/controllers/RegisterUser.js
 - Problema: Aceita senha de qualquer tamanho. O endpoint de reset-password valida mínimo 6 caracteres, mas o registro não valida.

 ---
 PRIORIDADE 4 — Pontas Soltas e Funcionalidades Incompletas

 21. O que acontece com dados do visitante quando ele faz login?

 - Ponta solta crítica de UX/produto: O visitante cria garantias no localStorage. Quando faz login, essas garantias desaparecem da visão? São importadas para o backend? Precisam de uma decisão de produto e implementação:
   - Opção A: Migrar automaticamente as garantias do localStorage para o backend ao fazer login
   - Opção B: Avisar o usuário que os dados locais não serão sincronizados
   - Opção C: Manter duas listas separadas (não recomendado)

 22. Sistema de notificações existe no banco mas nunca foi implementado

 - Model Notificacao e migration existem; nenhum controller, rota ou lógica de disparo foi criado.

 23. Rota /reset-password duplicada no App.tsx

 - Arquivo: Front-End/src/App.tsx linha 35
 - Fix: Remover a linha duplicada.

 24. /garantia/:id (ViewWarranty) não está protegida por ProtectedRoute

 - Arquivo: Front-End/src/App.tsx linha 59
 - Fix: Envolver em <ProtectedRoute> — ou decidir se visitantes também podem ver detalhes de garantias locais.

 25. Páginas mortas: WarrantyRegister.tsx e Verifycode.tsx

 - Não referenciadas em nenhuma rota ativa. Aumentam o bundle sem função.

 26. Sem paginação em nenhum endpoint do backend

 - GET /garantias retorna todos os registros. Com volume crescente, resulta em timeout.

 27. Sem índices nas foreign keys das migrations

 - Performance de JOINs degradada em produção com volume de dados.

 28. Cálculo de data final de garantia sem controle de timezone

 - Arquivo: Back-End/src/utils/garantiaUtils.js
 - Problema: new Date() usa timezone do servidor. Se o banco armazena DATEONLY, pode haver deslocamento de 1 dia.
 - Fix: Padronizar para UTC em toda a stack.

 29. Validação de produto_id ausente antes de criar garantia

 - Arquivo: Back-End/src/controllers/Garantia.js
 - Cria garantia com FK inválida; quem reporta o erro é o banco, não uma resposta HTTP clara ao cliente.

 30. Sem endpoints para Documento_Fiscal e Notificacao

 - Models e migrations existem, mas não há rotas/controllers.

 ---
 Pergunta: Outros usuários veem as alterações do usuário logado?

 Não — por dois motivos distintos:

 1. Todos os dados ficam em localStorage — como o WarrantyContext não é auth-aware, mesmo usuários autenticados têm seus dados somente no browser. Nenhum dado chega ao PostgreSQL, então não há nada para outros usuários verem.
 2. Mesmo após integrar com a API: não há WebSocket, SSE ou polling. Dados só são atualizados quando o usuário recapraga a página manualmente. Mudanças feitas por outros usuários não aparecem em tempo real.

 Após a integração com a API ser implementada: cada usuário verá as garantias associadas ao seu usuario_id — que é o comportamento correto para isolamento de dados por usuário.

 ---
 O sistema está pronto para deploy?

 Não. Prontidão estimada: ~10%.

 ┌─────────────────────────────┬────────────────────────────────────────────┬───────────────────────────────────────────────┐
 │            Área             │                   Status                   │                  Observação                   │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Auth (login/registro)       │ Parcialmente funciona                      │ Login OK; registro com bug de tipo no retorno │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ CRUD de garantias           │ Não funciona                               │ localStorage apenas; sem integração API       │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Banco de dados (migrations) │ Não roda completamente                     │ Erros de sintaxe na constraint CHECK          │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Modelos Sequelize           │ 2 modelos quebrados                        │ documento_fiscal e garantia_estendida         │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Controllers                 │ 2 controllers com bugs críticos de runtime │ GarantiaEstendida, RegisterEquipments         │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Variáveis de ambiente       │ Ausentes                                   │ Sem .env no frontend; process.exit comentado  │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Segurança                   │ Vulnerável                                 │ JWT em logs, console.logs, rotas sem proteção │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Notificações                │ Não implementado                           │ Model existe, lógica não existe               │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Upload de arquivos          │ Não implementado no backend                │ Apenas base64 no localStorage                 │
 ├─────────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
 │ Testes                      │ Nenhum                                     │                                               │
 └─────────────────────────────┴────────────────────────────────────────────┴───────────────────────────────────────────────┘

  PRIORIDADE 3 — Segurança

  15. Middleware autenticarToken duplicado em 4 arquivos — inconsistência já existe (req.user vs req.usuario). Correção de segurança precisa de 4 pontos.
  16. JWT decodificado em console.log (authToken.js) — expõe claims do token nos logs de produção.
  17. console.log de debug em ForgotPassword (linhas 81-95) — expõe tokens de reset em log.
  18. CORS hardcoded no código (app.js) — deve vir de process.env.CORS_ORIGIN.
  19. Sem validação de expiração do JWT no frontend (AuthContext.tsx) — token expirado continua sendo enviado.
  20. Sem validação de senha mínima no registro (RegisterUser.js) — reset-password valida 6 chars, registro não valida.

  ---
  PRIORIDADE 4 — Pontas Soltas e Funcionalidades Incompletas

  21. Estratégia de migração de dados do visitante — maior ponta solta de produto: quando o visitante faz login, as garantias do localStorage somem? São enviadas ao backend? É necessária uma decisão + implementação.
  22. Sistema de notificações existe no banco mas nunca foi implementado — model + migration existem, sem controller, rota ou lógica de disparo.
  23. Rota /reset-password duplicada (App.tsx linha 35) — segunda declaração sobrescreve a primeira.
  24. /garantia/:id (ViewWarranty) sem ProtectedRoute — visitante acessa direto. Decidir se é intencional.
  25. Páginas mortas: WarrantyRegister.tsx e Verifycode.tsx — não referenciadas em nenhuma rota.
  26. Sem paginação em nenhum endpoint — GET /garantias retorna todos os registros, causará timeout com volume crescente.
  27. Sem índices nas foreign keys — performance de JOINs degradada em produção.
  28. Sem controle de timezone (garantiaUtils.js) — new Date() usa timezone do servidor; pode deslocar 1 dia em relação ao DATEONLY do banco.
  29. Sem validação de existência do produto_id antes de criar garantia — erro FK do banco, sem mensagem clara ao cliente.
  30. Sem endpoints para Documento_Fiscal e Notificacao — models e migrations existem sem rotas/controllers.

  ---
  Outros usuários veem as alterações do usuário logado?

  Não — por dois motivos:

  1. Como o WarrantyContext não é auth-aware, nenhum dado chega ao PostgreSQL. Mesmo logado, os dados ficam só no browser local. Não há nada no banco para outros usuários verem.
  2. Mesmo após integrar a API: não há WebSocket, SSE nem polling. Dados só atualizam no reload manual da página.

  Após a integração com a API ser implementada corretamente, cada usuário verá as garantias associadas ao seu usuario_id — que é o isolamento correto.

  ---
  O sistema está pronto para deploy?

  Não. Prontidão estimada: ~10%.

  ┌───────────────────────┬───────────────────────────────────────────┐
  │         Área          │                  Status                   │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Login/Auth            │ Parcialmente funciona                     │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ CRUD de garantias     │ Não funciona (sem integração API)         │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Migrations do banco   │ Não roda completamente (erros de sintaxe) │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Modelos Sequelize     │ 2 quebrados                               │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Controllers           │ 2 com bugs críticos de runtime            │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Variáveis de ambiente │ Ausentes                                  │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Segurança             │ Vulnerável                                │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Notificações          │ Model existe, sistema inexistente         │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Upload de arquivos    │ Não implementado no backend               │
  ├───────────────────────┼───────────────────────────────────────────┤
  │ Testes                │ Nenhum                                    │
  └───────────────────────┴───────────────────────────────────────────┘

