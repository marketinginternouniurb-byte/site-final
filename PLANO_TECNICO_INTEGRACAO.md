# Plano Técnico de Integração - Universal Urbanismo

## 📋 Visão Geral

Este documento descreve o plano técnico para integração do site da Universal Urbanismo com o CVCRM, incluindo as 5 fases de implementação: Leads, Mapa 3D, Agendamento, Bot WhatsApp e Newsletter.

---

## 🎯 Fase 1: Integração de Leads (CVCRM)

**Status:** ✅ **EM PROGRESSO**

### Objetivo
Enviar dados de formulários do site (cadastro de e-mail, interesse em empreendimento) diretamente para o CVCRM, incluindo a origem do lead (Instagram, Facebook, Site).

### Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/TS)                     │
│                   Página de Contato (contato.tsx)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Formulário: Nome, E-mail, Telefone, Mensagem, Origem │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /api/send-lead-to-cvcrm
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase Edge Function (Deno/TypeScript)            │
│         send-lead-to-cvcrm/index.ts                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Valida dados recebidos                            │   │
│  │ 2. Mapeia campos para formato CVCRM                  │   │
│  │ 3. Autentica com headers email e token               │   │
│  │ 4. Envia POST para API CVCRM                         │   │
│  │ 5. Retorna resposta ao frontend                      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  CVCRM API (universal.cvcrm.com.br)         │
│          POST /api/v1/comercial/leads                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Cria novo lead no sistema CVCRM                      │   │
│  │ Armazena: nome, email, telefone, origem, mensagem    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Implementação Realizada

#### 1. Configuração de Ambiente
- **Arquivo:** `.env`
- **Variáveis:**
  - `CVCRM_EMAIL`: e-mail do usuario de integracao do CVCRM
  - `CVCRM_TOKEN`: token de integracao do CVCRM
  - `CVCRM_DOMAIN`: dominio do cliente no CVCRM (`universal`)

#### 2. Supabase Edge Function
- **Arquivo:** `supabase/functions/send-lead-to-cvcrm/index.ts`
- **Funcionalidades:**
  - Recebe dados do formulário via POST
  - Valida campos obrigatórios (nome, email, telefone, origem)
  - Mapeia dados para o formato esperado pela API CVCRM
  - Autentica com headers `email` e `token`
  - Envia requisicao POST para `https://universal.cvcrm.com.br/api/v1/comercial/leads`
  - Retorna resposta com sucesso ou erro

#### 3. Modificação do Formulário de Contato
- **Arquivo:** `src/routes/contato.tsx`
- **Alterações:**
  - Adicionado campo `origin` com valor padrão "Site"
  - Substituído envio direto ao Supabase por chamada à Edge Function
  - Melhorado tratamento de erros com feedback ao usuário

### Próximos Passos

1. **Testar a Integração:**
   ```bash
   cd site-final
   npm run dev
   # Acessar http://localhost:5173/contato
   # Preencher formulário e submeter
   # Verificar resposta e logs
   ```

2. **Configurar Variáveis de Ambiente no Supabase:**
   ```bash
   wrangler secret put CVCRM_EMAIL
   wrangler secret put CVCRM_TOKEN
   wrangler secret put CVCRM_DOMAIN
   ```

3. **Deploy da Edge Function:**
   ```bash
   supabase functions deploy send-lead-to-cvcrm
   ```

4. **Validar no CVCRM:**
   - Acessar o painel do CVCRM
   - Verificar se os leads estão sendo criados corretamente
   - Confirmar que a origem está sendo registrada

---

## 🗺️ Fase 2: Mapa 3D e Disponibilidade de Lotes em Tempo Real

**Status:** ⏳ **PLANEJADO**

### Objetivo
Conectar o site ao CVCRM para exibir quais lotes estão disponíveis ou vendidos em um mapa 3D, com atualização automática.

### Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React/TS)                        │
│              Componente: MapaLotes3D.tsx                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Renderiza mapa 3D com Three.js ou Google Maps 3D     │   │
│  │ Exibe lotes: verde (disponível), vermelho (vendido)  │   │
│  │ Atualiza a cada 30 segundos (polling)                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ GET /api/get-lotes-status
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase Edge Function (Deno/TypeScript)            │
│         get-lotes-status/index.ts                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Consulta API CVCRM para status de unidades        │   │
│  │ 2. Filtra por empreendimento (se necessário)         │   │
│  │ 3. Mapeia dados para formato frontend                │   │
│  │ 4. Retorna lista de lotes com status                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ GET
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  CVCRM API (universal.cvcrm.com.br)         │
│          GET /api/v3/unidades                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Retorna lista de unidades/lotes com status:          │   │
│  │ - ID, nome, localização, status (disponível/vendido) │   │
│  │ - Preço, área, etc.                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologias Recomendadas
- **Visualização 3D:** Three.js ou Google Maps Platform (3D Maps API)
- **Atualização:** Polling a cada 30 segundos ou Webhooks CVCRM (se disponível)
- **Dados:** Supabase para cache local de coordenadas de lotes

### Estrutura de Dados Esperada

```typescript
interface Lote {
  id: string;
  nome: string;
  empreendimento_id: string;
  latitude: number;
  longitude: number;
  area: number;
  preco: number;
  status: "disponivel" | "vendido" | "reservado";
  url_imagem?: string;
}
```

---

## 📅 Fase 3: Agendamento de Visitas

**Status:** ⏳ **PLANEJADO**

### Objetivo
Adicionar um botão no site para agendar visitas a lotes específicos, gerando automaticamente um agendamento no CVCRM e notificando o vendedor.

### Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React/TS)                        │
│         Modal/Página: AgendarVisita.tsx                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Formulário: Lote, Data, Hora, Cliente (pré-preenchido)
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /api/agendar-visita
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase Edge Function (Deno/TypeScript)            │
│         agendar-visita/index.ts                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Valida disponibilidade da data/hora               │   │
│  │ 2. Consulta vendedor associado ao lote               │   │
│  │ 3. Cria agendamento no CVCRM                         │   │
│  │ 4. Notifica vendedor (email/SMS/WhatsApp)            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  CVCRM API (universal.cvcrm.com.br)         │
│          POST /api/v3/prospeccao/agendamentos               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Cria novo agendamento no sistema CVCRM              │   │
│  │ Associa ao lead e ao lote                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Dados Esperada

```typescript
interface Agendamento {
  id_lote: string;
  id_cliente: string;
  data_agendamento: string; // ISO 8601
  hora_agendamento: string; // HH:mm
  observacoes?: string;
}
```

---

## 💬 Fase 4: Bot de WhatsApp com IA

**Status:** ⏳ **PLANEJADO**

### Objetivo
Implementar um bot de WhatsApp que qualifica leads usando IA (ChatGPT) e os direciona para o vendedor (se qualificado) ou para uma fila de reciclagem.

### Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (WhatsApp)                       │
│              Envia mensagem para número da empresa            │
└────────────────────────────┬────────────────────────────────┘
                             │ Webhook
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Typebot (Chatbot)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Recebe mensagem do cliente                        │   │
│  │ 2. Inicia fluxo de qualificação                      │   │
│  │ 3. Faz perguntas ao cliente                          │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ Integração com OpenAI
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI (ChatGPT)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Processa respostas do cliente                     │   │
│  │ 2. Determina qualificação (score)                    │   │
│  │ 3. Retorna decisão para Typebot                      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
           Qualificado         Não Qualificado
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ Envia para CVCRM │  │ Fila de Reciclagem
         │ Notifica Vendedor│  │ (Supabase)
         │ SuperChat        │  │ Campanha Mensal
         └──────────────────┘  └──────────────────┘
```

### Configuração Necessária

1. **Typebot:** Criar fluxo de qualificação
2. **OpenAI API:** Integração com ChatGPT para análise de respostas
3. **CVCRM Webhooks:** Receber eventos de qualificação
4. **SuperChat:** Integração para notificação de vendedores (se aplicável)

---

## 📧 Fase 5: Sistema de Notícias + Newsletter Automática

**Status:** ⏳ **PLANEJADO**

### Objetivo
Criar uma seção de notícias no site e disparar newsletters automáticas segmentadas por interesse.

### Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React/TS)                        │
│              Componente: BlogPreview.tsx                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Exibe últimas notícias do Supabase                   │   │
│  │ Formulário de assinatura de newsletter               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              GET /blog          POST /subscribe
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Supabase (DB)   │  │  Supabase (DB)   │
         │  Tabela: posts   │  │  Tabela: subs    │
         │  - Notícias      │  │  - Assinantes    │
         │  - Publicadas    │  │  - Interesses    │
         └──────────────────┘  └──────────────────┘
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
         ┌──────────────────────────────────────┐
         │  Supabase Cron Job (Diário)          │
         │  send-newsletter/index.ts            │
         │  1. Busca novas notícias             │
         │  2. Segmenta assinantes por interesse│
         │  3. Envia via Resend/SendGrid        │
         └──────────────────────────────────────┘
                             │
                             ▼
         ┌──────────────────────────────────────┐
         │  Resend ou SendGrid (Email Service)  │
         │  Dispara newsletters segmentadas     │
         └──────────────────────────────────────┘
```

### Estrutura de Dados Esperada

```typescript
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  published: boolean;
  published_at: string;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  interests: string[]; // categorias de interesse
  subscribed_at: string;
  active: boolean;
}
```

---

## 📁 Estrutura de Pastas do Projeto

```
site-final/
├── .env                                    # Variáveis de ambiente
├── PLANO_TECNICO_INTEGRACAO.md            # Este arquivo
├── supabase/
│   └── functions/
│       ├── send-lead-to-cvcrm/
│       │   └── index.ts                   # Edge Function: Envio de leads
│       ├── get-lotes-status/
│       │   └── index.ts                   # Edge Function: Status de lotes (Fase 2)
│       ├── agendar-visita/
│       │   └── index.ts                   # Edge Function: Agendamento (Fase 3)
│       └── send-newsletter/
│           └── index.ts                   # Cron Job: Newsletter (Fase 5)
├── src/
│   ├── routes/
│   │   ├── contato.tsx                    # ✅ Modificado: Integração com CVCRM
│   │   ├── mapa-lotes.tsx                 # 📋 Novo: Mapa 3D de lotes (Fase 2)
│   │   ├── agendar-visita.tsx             # 📋 Novo: Agendamento (Fase 3)
│   │   └── blog.tsx                       # 📋 Novo: Blog/Notícias (Fase 5)
│   ├── components/
│   │   ├── home/
│   │   │   └── BlogPreview.tsx            # ✅ Existente: Preview de notícias
│   │   ├── mapa/
│   │   │   ├── MapaLotes3D.tsx            # 📋 Novo: Componente do mapa 3D
│   │   │   └── LoteMarker.tsx             # 📋 Novo: Marcador de lote
│   │   ├── agendamento/
│   │   │   ├── FormAgendamento.tsx        # 📋 Novo: Formulário de agendamento
│   │   │   └── SeletorDataHora.tsx        # 📋 Novo: Seletor de data/hora
│   │   ├── newsletter/
│   │   │   ├── FormNewsletter.tsx         # 📋 Novo: Formulário de inscrição
│   │   │   └── NewsletterCard.tsx         # 📋 Novo: Card de newsletter
│   │   └── shared/
│   │       └── (componentes compartilhados)
│   ├── integrations/
│   │   ├── cvcrm/
│   │   │   ├── client.ts                  # 📋 Novo: Cliente HTTP para CVCRM
│   │   │   └── types.ts                   # 📋 Novo: Tipos TypeScript para CVCRM
│   │   ├── openai/
│   │   │   └── client.ts                  # 📋 Novo: Cliente para OpenAI (Fase 4)
│   │   └── email/
│   │       └── client.ts                  # 📋 Novo: Cliente para Resend/SendGrid
│   └── lib/
│       ├── cvcrm-utils.ts                 # 📋 Novo: Utilitários para CVCRM
│       └── validation.ts                  # 📋 Novo: Validação de formulários
└── docs/
    ├── FASE1_IMPLEMENTACAO.md             # 📋 Novo: Detalhes Fase 1
    ├── FASE2_MAPA3D.md                    # 📋 Novo: Detalhes Fase 2
    ├── FASE3_AGENDAMENTO.md               # 📋 Novo: Detalhes Fase 3
    ├── FASE4_WHATSAPP_BOT.md              # 📋 Novo: Detalhes Fase 4
    └── FASE5_NEWSLETTER.md                # 📋 Novo: Detalhes Fase 5
```

---

## 🔑 Variáveis de Ambiente Necessárias

```env
# CVCRM
CVCRM_EMAIL=<email-integracao>
CVCRM_TOKEN=<sua-token-aqui>
CVCRM_DOMAIN=universal

# OpenAI (Fase 4)
VITE_OPENAI_API_KEY=<sua-chave-aqui>

# Email Service (Fase 5)
VITE_RESEND_API_KEY=<sua-chave-aqui>
# ou
VITE_SENDGRID_API_KEY=<sua-chave-aqui>

# Google Maps (Fase 2, opcional)
VITE_GOOGLE_MAPS_API_KEY=<sua-chave-aqui>
```

---

## 🚀 Próximos Passos

### Imediato (Semana 1)
- [ ] Testar Fase 1 (Integração de Leads)
- [ ] Deploy da Edge Function `send-lead-to-cvcrm`
- [ ] Validar leads sendo criados no CVCRM

### Curto Prazo (Semana 2-3)
- [ ] Iniciar Fase 2 (Mapa 3D)
- [ ] Criar Edge Function `get-lotes-status`
- [ ] Implementar componente `MapaLotes3D.tsx`

### Médio Prazo (Semana 4-5)
- [ ] Implementar Fase 3 (Agendamento)
- [ ] Criar formulário de agendamento
- [ ] Integrar com notificações de vendedores

### Longo Prazo (Semana 6+)
- [ ] Fase 4 (Bot WhatsApp com IA)
- [ ] Fase 5 (Newsletter Automática)
- [ ] Testes de carga e otimização

---

## 📞 Suporte e Documentação

- **CVCRM API Docs:** https://desenvolvedor.cvcrm.com.br/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **OpenAI API:** https://platform.openai.com/docs
- **Typebot:** https://typebot.io/

---

**Última atualização:** 27 de Maio de 2026  
**Responsável:** Manus AI  
**Status Geral:** ✅ Fase 1 em Progresso | ⏳ Fases 2-5 Planejadas
