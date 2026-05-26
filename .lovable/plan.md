## Visão geral

Adicionar um painel de gestão (admin/corretor) ao site da Universal Imobiliária, mantendo toda a vitrine pública atual. Os dados estáticos (`src/lib/propertyData.ts`) serão substituídos por consultas ao banco. Imagens vão para storage. Acesso ao painel é restrito por papel.

## Backend (Lovable Cloud)

Ativar Lovable Cloud e criar:

**Tabelas**
- `profiles` (id = auth.users.id, full_name, phone, avatar_url, created_at)
- `user_roles` (user_id, role: enum `admin` | `corretor`) — tabela separada por segurança
- `properties` (id, name, type, location, status, price, price_value, area, description, features text[], image, gallery text[], map_url, featured bool, created_by, timestamps)
- `leads` (id, property_id nullable, name, email, phone, message, status: novo/em_atendimento/convertido/perdido, assigned_to nullable, created_at)
- `blog_posts` (id, title, slug, excerpt, content, category, image, published bool, created_by, timestamps)
- `testimonials` (id, name, role, rating, text, approved bool, created_at)
- `newsletter_subscribers` (id, email unique, created_at)

**Função SECURITY DEFINER** `has_role(user_id, role)` para evitar recursão em RLS.

**RLS**
- Vitrine pública: SELECT liberado em `properties`, `blog_posts (published)`, `testimonials (approved)`.
- `leads`, `newsletter_subscribers`: INSERT público (formulário); SELECT/UPDATE só admin/corretor (corretor vê só leads atribuídos a ele).
- `profiles`: usuário lê/edita o próprio; admin lê todos.
- `user_roles`: só admin escreve; usuário lê o próprio.
- Mutações em `properties`, `blog_posts`, `testimonials`: só admin.

**Storage**
- Bucket `property-images` (público para leitura, upload restrito a admin/corretor).
- Bucket `blog-images` (idem).

**Trigger** `on_auth_user_created` para criar `profiles` automaticamente.

## Autenticação

- Email/senha (sem Google neste primeiro momento — pode ser adicionado depois).
- Página `/login` pública.
- Sem cadastro aberto: novos corretores são convidados pelo admin de dentro do painel (cria conta + atribui papel).
- Confirmação de email desabilitada para acelerar testes (pode reativar).

## Estrutura de rotas

```
src/routes/
  index.tsx               (já existe)
  empreendimentos.index.tsx
  empreendimentos.$id.tsx
  sobre.tsx
  contato.tsx
  login.tsx                       NOVO
  _admin.tsx                      NOVO  (layout protegido)
    _admin/index.tsx              dashboard com métricas
    _admin/empreendimentos.tsx    lista + criar
    _admin/empreendimentos.$id.tsx editar
    _admin/leads.tsx              fila de leads
    _admin/blog.tsx               lista + criar
    _admin/blog.$id.tsx           editar
    _admin/depoimentos.tsx        moderação
    _admin/usuarios.tsx           só admin: gerenciar corretores
    _admin/perfil.tsx             editar próprio perfil
```

`_admin` usa `beforeLoad` para redirecionar não autenticados para `/login` e bloqueia quem não tem papel admin/corretor.

## Painel — funcionalidades

**Dashboard** (`/_admin`)
- Cards: total de imóveis, leads novos, leads em atendimento, conversões do mês.
- Últimos leads e últimos imóveis cadastrados.

**Empreendimentos**
- Tabela com busca, filtros (tipo, status), ações editar/excluir.
- Form de criação/edição com upload de imagem principal + galeria, campos de features dinâmicos, marcar como "destaque".

**Leads**
- Kanban ou tabela por status (novo → em_atendimento → convertido/perdido).
- Atribuir a um corretor (drag/select).
- Detalhe do lead com histórico, link para imóvel relacionado, botão WhatsApp pré-preenchido.
- Corretor vê apenas leads atribuídos; admin vê todos.

**Blog**
- Lista com publicado/rascunho.
- Editor (textarea com Markdown ou rich-text simples), categoria, imagem de capa, slug auto.

**Depoimentos**
- Lista de pendentes; aprovar/reprovar; campo rating.

**Usuários** (só admin)
- Convidar corretor por email (cria via auth admin API server-fn) → atribui papel `corretor`.
- Listar/remover corretores.

**Perfil** — editar nome/telefone/avatar.

## Vitrine pública — ajustes

- Substituir `properties`, `testimonials`, `blogPosts` estáticos por server-fn que faz `select` no banco (com cache via React Query).
- Form de contato (`/contato`) e newsletter do footer passam a inserir em `leads` / `newsletter_subscribers` via server-fn (RLS permite INSERT anônimo).
- Form de "Tenho interesse" no detalhe do imóvel cria `lead` com `property_id` preenchido.
- Botão "Painel" aparece no Navbar apenas para usuários autenticados com papel.

## Detalhes técnicos

- `createServerFn` + `requireSupabaseAuth` para todas as mutações do painel.
- `supabaseAdmin` apenas em server-fn para convidar usuário (admin API).
- React Query para cache/refetch.
- Upload de imagem: server-fn que recebe FormData → upload em bucket → retorna URL pública.
- Validação com Zod em todos os inputs (server e client).
- shadcn já disponível: usar `Table`, `Dialog`, `Form`, `Sidebar` (para layout do painel), `Tabs`, `Badge`, `Sonner` para toasts.
- Layout do painel com `SidebarProvider` + `AppSidebar` colapsável.

## Migração de dados

Seed inicial: inserir os 6 imóveis, 8 depoimentos e 3 posts de blog atuais via SQL na primeira migration, para a vitrine continuar populada do dia 1.

## Ordem de execução

1. Ativar Lovable Cloud.
2. Migration: enums, tabelas, função `has_role`, RLS, trigger de profile, buckets, seed.
3. Página de login + layout `_admin` protegido + Navbar com link condicional.
4. Server-fns CRUD (properties, leads, blog, testimonials, users).
5. Telas do painel (dashboard, listas, formulários, kanban de leads).
6. Conectar vitrine pública ao banco e plugar formulários (contato, interesse, newsletter).
7. Tela de gerenciamento de usuários (convite de corretores).
