import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Cookie,
  Database,
  FileCheck2,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import PageShell from "@/components/layout/PageShell";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade e LGPD — Universal Urbanismo" },
      {
        name: "description",
        content:
          "Política de Privacidade da Universal Urbanismo: coleta, uso, proteção de dados pessoais, cookies e direitos previstos na LGPD.",
      },
      {
        property: "og:title",
        content: "Política de Privacidade e LGPD — Universal Urbanismo",
      },
      {
        property: "og:description",
        content:
          "Saiba como a Universal Urbanismo trata dados pessoais e como exercer seus direitos como titular.",
      },
    ],
  }),
  component: PoliticaDePrivacidade,
});

const highlights = [
  {
    icon: Scale,
    title: "LGPD",
    text: "Tratamento de dados fundamentado na Lei nº 13.709/2018, especialmente nas bases legais aplicáveis de consentimento, execução contratual, obrigação legal e legítimo interesse.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    text: "Medidas técnicas e organizacionais para proteger dados contra acesso não autorizado, perda, alteração, uso indevido ou destruição.",
  },
  {
    icon: UserCheck,
    title: "Direitos do titular",
    text: "Canais para solicitar confirmação, acesso, correção, portabilidade, exclusão, informação sobre compartilhamento e revogação de consentimento.",
  },
];

const sections = [
  {
    icon: FileCheck2,
    title: "1. Introdução",
    text: [
      "A Imobiliária e Construtora Universal Ltda, inscrita no CNPJ nº 37.060.640/0001-05, valoriza a privacidade de clientes, visitantes, interessados e parceiros.",
      "Esta política explica como coletamos, utilizamos, armazenamos, compartilhamos e protegemos dados pessoais recebidos pelo site, formulários, WhatsApp, e-mail, redes sociais oficiais e demais canais digitais da Universal Urbanismo.",
    ],
  },
  {
    icon: Scale,
    title: "2. Base legal para tratamento de dados",
    text: [
      "O tratamento de dados pessoais observa a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). As principais bases legais utilizadas são consentimento, execução de contrato ou procedimentos preliminares, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, prevenção a fraudes e legítimo interesse.",
      "Dados pessoais sensíveis não são coletados como regra. Caso sejam necessários em situações específicas, o tratamento ocorrerá apenas quando houver base legal adequada, finalidade legítima e medidas reforçadas de proteção.",
    ],
  },
  {
    icon: Database,
    title: "3. Dados pessoais que podemos coletar",
    list: [
      "Dados de identificação e contato, como nome, telefone, e-mail, CPF, RG e endereço, quando fornecidos pelo titular.",
      "Dados informados em formulários de contato, cadastros, solicitações de proposta, inscrições em programas, atendimento por WhatsApp, e-mail ou redes sociais.",
      "Dados técnicos de navegação necessários ao funcionamento do site, como endereço IP, tipo de navegador, sistema operacional, registros de acesso e dados de segurança gerados pela infraestrutura utilizada.",
      "Dados de autenticação e sessão de usuários administrativos, armazenados por tecnologias como localStorage quando o login é utilizado.",
      "Informações financeiras, comerciais ou de pagamento quando necessárias para análise, negociação, compra, venda ou financiamento de lotes.",
    ],
  },
  {
    icon: UserCheck,
    title: "4. Finalidades do tratamento",
    list: [
      "Responder dúvidas, solicitações, contatos comerciais e pedidos de proposta.",
      "Gerenciar relacionamento com clientes, interessados, compradores, parceiros e fornecedores.",
      "Executar contratos, procedimentos preliminares e rotinas relacionadas à compra e venda de lotes.",
      "Enviar comunicações institucionais, novidades, lançamentos e oportunidades quando o usuário solicitar ou autorizar.",
      "Melhorar a experiência de navegação e medir desempenho do site apenas quando houver base legal adequada e, para cookies não essenciais, conforme a preferência registrada pelo usuário.",
      "Cumprir obrigações legais, regulatórias, fiscais, administrativas e judiciais.",
      "Prevenir fraudes, proteger sistemas, preservar a segurança da informação e exercer direitos em processos administrativos ou judiciais.",
    ],
  },
  {
    icon: Globe2,
    title: "5. Compartilhamento e transferência de dados",
    text: [
      "Dados pessoais podem ser compartilhados com colaboradores, consultores, prestadores de serviço, parceiros comerciais, instituições financeiras, cartórios, órgãos públicos, autoridades administrativas ou judiciais, sempre que necessário para cumprir as finalidades desta política ou exigências legais.",
      "O site utiliza fornecedores de infraestrutura e tecnologia, como Supabase, provedores de hospedagem, Google Fonts e serviços externos acessados voluntariamente pelo usuário, como WhatsApp, Instagram, Facebook, TikTok e YouTube. Esses serviços podem tratar dados conforme suas próprias políticas quando o usuário interage com eles.",
      "A Universal Urbanismo não vende nem aluga dados pessoais. O compartilhamento para ações de marketing de terceiros depende de consentimento prévio do titular.",
      "Algumas informações podem ser armazenadas ou processadas em servidores no Brasil ou no exterior, desde que adotadas salvaguardas compatíveis com a LGPD.",
    ],
  },
  {
    icon: LockKeyhole,
    title: "6. Retenção, exclusão e segurança",
    text: [
      "Os dados pessoais serão mantidos pelo tempo necessário ao cumprimento das finalidades informadas, ao atendimento de obrigações legais ou ao exercício regular de direitos.",
      "Quando deixarem de ser necessários, os dados poderão ser excluídos, anonimizados ou mantidos de forma segura quando houver obrigação legal ou base legítima para conservação.",
      "Apesar das medidas de proteção adotadas, nenhum ambiente digital é absolutamente imune a riscos. Por isso, recomendamos que usuários também adotem boas práticas, como usar canais oficiais e evitar o envio de informações sensíveis por meios não confiáveis.",
    ],
  },
  {
    icon: UserCheck,
    title: "7. Direitos do titular",
    list: [
      "Confirmar a existência de tratamento de dados pessoais.",
      "Solicitar acesso aos dados tratados pela Universal Urbanismo.",
      "Corrigir dados incompletos, inexatos ou desatualizados.",
      "Solicitar anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.",
      "Solicitar portabilidade, quando aplicável e nos termos da regulamentação vigente.",
      "Receber informações sobre compartilhamento de dados.",
      "Revogar consentimento e solicitar eliminação de dados tratados com base no consentimento, observadas as hipóteses legais de conservação.",
    ],
  },
  {
    icon: Cookie,
    title: "8. Cookies, preferências e tecnologias semelhantes",
    text: [
      "O site utiliza uma ferramenta de consentimento para registrar preferências de cookies. Cookies essenciais permanecem ativos porque são necessários para segurança, funcionamento, login administrativo, prevenção de abusos e registro da própria preferência de privacidade.",
      "A preferência é registrada pelo cookie essencial universal_cookie_consent e por armazenamento local equivalente. A autenticação administrativa do Supabase também pode usar localStorage para manter a sessão de usuários autorizados.",
      "Cookies de analytics e marketing permanecem desativados por padrão e só podem ser usados após autorização do usuário. Atualmente, o site não carrega scripts próprios de analytics ou pixels de marketing antes dessa autorização.",
      "As preferências são armazenadas em cookie e localStorage do navegador. O usuário pode revisar ou alterar sua escolha a qualquer momento pelo link “Revisar cookies” no rodapé.",
      "O usuário também pode configurar o navegador para bloquear ou excluir cookies. Algumas funcionalidades do site podem não funcionar corretamente caso cookies essenciais sejam desativados.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "9. Crianças e adolescentes",
    text: [
      "A Universal Urbanismo não coleta intencionalmente dados pessoais de menores de 18 anos por meio do site. Caso seja identificada coleta inadvertida, as informações serão excluídas ou tratadas conforme a base legal aplicável e com as cautelas previstas em lei.",
    ],
  },
  {
    icon: FileCheck2,
    title: "10. Atualizações desta política",
    text: [
      "Esta política poderá ser atualizada periodicamente para refletir mudanças legais, regulatórias, tecnológicas ou operacionais. A versão mais recente estará sempre disponível nesta página.",
    ],
  },
];

function PoliticaDePrivacidade() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-[#071947] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.18),transparent_32%),linear-gradient(135deg,rgba(18,58,170,0.98),rgba(7,25,71,1))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF9F6] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#123AAA] px-4 py-2 rounded-lg mb-6">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                Privacidade e LGPD
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.98] mb-6">
              Política de Privacidade
              <span className="block text-[#FFD700]">Universal Urbanismo</span>
            </h1>

            <p className="text-base md:text-xl text-white/85 max-w-3xl leading-relaxed font-medium">
              Transparência sobre como tratamos dados pessoais, protegemos
              informações e respeitamos os direitos previstos na Lei Geral de
              Proteção de Dados.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-[#123AAA]/10 rounded-[28px] p-7 shadow-xl"
            >
              <item.icon className="w-8 h-8 text-[#FFD700] mb-5" />
              <h2 className="text-xl font-black text-[#123AAA] uppercase tracking-tight mb-3">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-12 px-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-[#123AAA] text-white rounded-[32px] p-8">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD700]">
                Controladora
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight mt-3 mb-5">
                Imobiliária e Construtora Universal Ltda
              </h2>
              <div className="space-y-5 text-sm text-white/80 font-medium leading-relaxed">
                <p>CNPJ nº 37.060.640/0001-05</p>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                  <p>
                    Av. Desembargador Mário da Silva Nunes, 717, Sala 1001,
                    Torre Sul, Jardim Limoeiro, Serra - ES, CEP 29.164-044
                  </p>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                  <a
                    href="mailto:universal@universalurbanismo.com"
                    className="hover:text-[#FFD700] transition-colors"
                  >
                    universal@universalurbanismo.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-5">
            {sections.map((section, index) => (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="bg-white border border-[#123AAA]/10 rounded-[28px] p-7 md:p-8 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD700] text-[#123AAA] flex items-center justify-center shrink-0">
                    <section.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-black text-[#123AAA] uppercase tracking-tight mb-4">
                      {section.title}
                    </h2>
                    {section.text && (
                      <div className="space-y-3">
                        {section.text.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-gray-600 leading-relaxed font-medium"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                    {section.list && (
                      <ul className="space-y-3">
                        {section.list.map((item) => (
                          <li key={item} className="flex gap-3 text-gray-600">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#FFD700] shrink-0" />
                            <span className="leading-relaxed font-medium">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto bg-[#FFD700] rounded-[36px] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#123AAA]/65">
              Exercício de direitos
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#123AAA] uppercase tracking-tight leading-tight mt-4">
              Quer falar sobre seus dados pessoais?
            </h2>
          </div>
          <div className="lg:col-span-4">
            <a
              href="mailto:universal@universalurbanismo.com"
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#123AAA] px-6 py-4 text-white font-black uppercase tracking-widest text-xs hover:bg-[#0d2f89] transition"
            >
              <Mail size={18} />
              Enviar solicitação
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
