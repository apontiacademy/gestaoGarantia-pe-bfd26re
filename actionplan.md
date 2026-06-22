 ---
  Plano de Ação — 5 Tarefas para Deploy 70%

  ---
  Tarefa 1 — Backend: corrigir erros que impedem o servidor de subir

  Backend

  Quatro bugs que causam crash imediato:
  - authToken.js: SECRET_KEY → process.env.JWT_SECRET
  - documento_fiscal.js: remover segundo primaryKey: true do campo produto_id
  - GarantiaEstendida.js: renomear variável para Garantia_Estendida em 6 pontos + corrigir where: { id_garantia_estendida: id } para where: { id }
  - auth.routes.js: importar const { Usuario } = require('../models')
  - app.js: descomentar process.exit(1)
  - Criar Back-End/.env preenchido

  ---
  Tarefa 2 — Backend: corrigir migrations para o banco subir limpo

 Backend

  - create-notificacoes.js: renomear coluna id_usuario → usuario_id
  - create-documento-fiscal.js: corrigir sintaxe da constraint CHECK (trocar where: por expression:)
  - create-produto.js: adicionar coluna status

  ---
  Tarefa 3 — Frontend: criar .env e corrigir bugs de auth

  Frontend

  - Criar Front-End/.env com VITE_API_URL=http://localhost:3000 ✅
  - authService.ts: corrigir tipo de retorno do register() de RegisterPayload para AuthResponse
  - App.tsx: remover rota /reset-password duplicada + proteger /garantia/:id com ProtectedRoute ✅

  ---
  Tarefa 4 — Frontend: tornar o WarrantyContext auth-aware (tarefa principal)

  Frontend 

  Hoje o WarrantyContext nunca lê o AuthContext — usa localStorage para todos. A correção:
  - Visitante (isAuthenticated === false): continua usando localStorage (comportamento atual)
  - Usuário logado (isAuthenticated === true): todas as operações (listar, criar, editar, deletar, restaurar) devem chamar a API

  Ponto de atenção: o shape do objeto Warranty no frontend é diferente do que o backend espera (o title é composto de nome + marca + modelo que ficam em tabelas separadas). Isso
  precisará de um endpoint "achatado" no backend ou mapeamento no frontend.
                                                                                                                                                                 
  ---                                                                                                                                                                                  
  Tarefa 5 — Limpeza de segurança mínima antes do deploy
                                                        
  Dev
                                                                                                                                                                                         
  - Remover console.log que expõe JWT decodificado (authToken.js)
  - Remover console.log de debug do fluxo de reset de senha (ForgotPassword.tsx)                                                                                                         
  - Mover URL do CORS para variável de ambiente (app.js)                                                                                                                               
  - Corrigir resposta dupla no RegisterEquipments.js (response fora do try)                                                                                                              
   
  ---                                                                                                                                                                                    
  Critério de Aceite para os 70%                                                                                                                                                       
                                                                                                                                                                                         
  - Backend sobe sem erros
  - Migrations rodam sem falha                                                                                                                                                           
  - Login e registro funcionam corretamente                                                                                                                                            
  - Garantias criadas por usuário logado aparecem no banco de dados
  - Garantias de visitante ficam no localStorage
  - Dados de um usuário não aparecem para outro
  - Refresh da página não perde os dados do usuário logado                                                                                                                               
  - Sem console.log expondo dados sensíveis
                                                                                                                                                                                         
  O que fica para depois dos 70%: notificações de vencimento, upload de arquivos para o backend, paginação, real-time, testes.                                                           
   
