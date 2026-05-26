-- ============= ENUMS =============
CREATE TYPE public.app_role AS ENUM ('admin', 'corretor');
CREATE TYPE public.property_type AS ENUM ('Residencial', 'Comercial', 'Loteamento');
CREATE TYPE public.property_status AS ENUM ('À Venda', 'Em Obras', 'Entregue');
CREATE TYPE public.lead_status AS ENUM ('novo', 'em_atendimento', 'convertido', 'perdido');

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============= USER ROLES =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (SECURITY DEFINER, prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- helper: any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','corretor')
  )
$$;

-- ============= PROPERTIES =============
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type property_type NOT NULL,
  location TEXT NOT NULL,
  status property_status NOT NULL DEFAULT 'À Venda',
  price TEXT NOT NULL,
  price_value NUMERIC NOT NULL DEFAULT 0,
  area TEXT,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  image TEXT,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  map_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- ============= LEADS =============
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status lead_status NOT NULL DEFAULT 'novo',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ============= BLOG POSTS =============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- ============= TESTIMONIALS =============
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  rating INT NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ============= NEWSLETTER =============
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============= updated_at trigger =============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= auto-create profile on signup =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= RLS POLICIES =============

-- profiles
CREATE POLICY "Profiles: own select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Profiles: own update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Profiles: admin update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "Roles: read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Roles: admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- properties
CREATE POLICY "Properties: public read" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Properties: admin write" ON public.properties FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Properties: admin update" ON public.properties FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Properties: admin delete" ON public.properties FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- leads
CREATE POLICY "Leads: public insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Leads: staff read" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'corretor') AND assigned_to = auth.uid()));
CREATE POLICY "Leads: staff update" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'corretor') AND assigned_to = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'corretor') AND assigned_to = auth.uid()));
CREATE POLICY "Leads: admin delete" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- blog_posts
CREATE POLICY "Blog: public read published" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "Blog: admin write" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Blog: admin update" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Blog: admin delete" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- testimonials
CREATE POLICY "Testimonials: public read approved" ON public.testimonials FOR SELECT TO anon, authenticated USING (approved = true OR public.is_staff(auth.uid()));
CREATE POLICY "Testimonials: admin write" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Testimonials: admin update" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Testimonials: admin delete" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- newsletter
CREATE POLICY "Newsletter: public insert" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Newsletter: staff read" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ============= STORAGE =============
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images','property-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images','blog-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read property-images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Staff upload property-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update property-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete property-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images' AND public.is_staff(auth.uid()));

CREATE POLICY "Public read blog-images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admin upload blog-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin update blog-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete blog-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog-images' AND public.has_role(auth.uid(),'admin'));

-- ============= SEED DATA =============
INSERT INTO public.properties (name, type, location, status, price, price_value, area, description, features, image, gallery, map_url, featured) VALUES
('Residencial Alphaville','Residencial','Serra, ES','À Venda','A partir de R$ 250.000',250000,'300m² a 500m²','Lotes residenciais de alto padrão em condomínio fechado com infraestrutura completa, área de lazer, segurança 24h e paisagismo impecável.',ARRAY['Condomínio Fechado','Área de Lazer','Segurança 24h','Próximo ao Shopping'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/ae04bae32_generated_6d31eb5c.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/ae04bae32_generated_6d31eb5c.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.31!3d-20.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', true),
('Torre Corporativa Universal','Comercial','Vitória, ES','Em Obras','A partir de R$ 8.000.000',8000000,'Salas de 40m² a 200m²','Torre comercial AAA no coração de Vitória, com certificação LEED, heliporto e vista panorâmica para a Baía de Vitória.',ARRAY['Certificação LEED','Heliporto','Vista Panorâmica','Estacionamento VIP'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/d12f32b1d_generated_b8167cf8.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/d12f32b1d_generated_b8167cf8.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.31!3d-20.31!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', true),
('Loteamento Parque das Águas','Loteamento','Vila Velha, ES','À Venda','A partir de R$ 180.000',180000,'200m² a 400m²','Loteamento premium com lago artificial, parque linear, ciclovia e completa infraestrutura de urbanismo sustentável.',ARRAY['Lago Artificial','Parque Linear','Ciclovia','Urbanismo Sustentável'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/ddeab85da_generated_7d63c112.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/ddeab85da_generated_7d63c112.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.28!3d-20.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', false),
('Villa Toscana Residencial','Residencial','Guarapari, ES','Entregue','A partir de R$ 450.000',450000,'400m² a 800m²','Casas e lotes em condomínio inspirado na Toscana italiana, com vinícola, spa e campo de golfe.',ARRAY['Condomínio Temático','Spa & Wellness','Campo de Golfe','Vinícola'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/2dde102cc_generated_41d01beb.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/2dde102cc_generated_41d01beb.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.50!3d-20.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', false),
('EcoVille Sustentável','Loteamento','Cariacica, ES','Em Obras','A partir de R$ 150.000',150000,'250m² a 500m²','O primeiro loteamento 100% sustentável do Espírito Santo, com energia solar, captação de água da chuva e áreas verdes preservadas.',ARRAY['Energia Solar','Água da Chuva','Áreas Preservadas','Hortas Comunitárias'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/538f8366b_generated_f307108f.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/538f8366b_generated_f307108f.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.41!3d-20.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', true),
('Reserva Imperial','Residencial','Vitória, ES','À Venda','A partir de R$ 1.200.000',1200000,'Apartamentos de 120m² a 300m²','Apartamentos de luxo com vista definitiva para o mar, acabamento premium e tecnologia de ponta em automação residencial.',ARRAY['Alto Padrão','Vista Mar','Rooftop','Automação Residencial'],'https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/74a4cd5c4_generated_c153db77.png',ARRAY['https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/74a4cd5c4_generated_c153db77.png'],'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3741.5!2d-40.29!3d-20.29!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDExJzI0LjAiUyA0MMKwMTgnMzYuMCJX!5e0!3m2!1spt-BR!2sbr!4v1', true);

INSERT INTO public.testimonials (name, role, rating, text, approved) VALUES
('Carlos Eduardo Mendes','Empresário',5,'Comprei meu lote no Parque das Águas e foi a melhor decisão da minha vida. A equipe da Universal é extremamente profissional e transparente em todo o processo.', true),
('Ana Beatriz Silva','Médica',5,'O atendimento foi impecável do início ao fim. Encontraram o apartamento perfeito para minha família na Reserva Imperial. Recomendo de olhos fechados!', true),
('Roberto Almeida','Investidor',5,'Já adquiri 3 lotes com a Universal e todos valorizaram acima da expectativa. A expertise deles em urbanismo é incomparável no mercado capixaba.', true),
('Fernanda Costa','Arquiteta',5,'Como profissional da área, reconheço a qualidade dos projetos da Universal. O loteamento EcoVille é referência em urbanismo sustentável.', true),
('Marcos Vinícius Souza','Engenheiro Civil',4,'Infraestrutura de primeira qualidade nos empreendimentos. A documentação sempre em dia e a entrega no prazo. Parceria que já dura mais de 10 anos.', true),
('Juliana Ferreira','Professora',5,'Realizei o sonho da casa própria graças à orientação da Universal. Me ajudaram com todo o processo de financiamento. Equipe nota 10!', true),
('Paulo Henrique Lima','Advogado',5,'Segurança jurídica total na compra do meu imóvel. A transparência da Universal em todas as etapas transmite confiança e profissionalismo.', true),
('Mariana Oliveira','Designer de Interiores',5,'A Villa Toscana superou todas as expectativas! O projeto urbanístico é magnífico e a valorização do imóvel já é visível. Investimento certeiro.', true);

INSERT INTO public.blog_posts (title, slug, excerpt, content, category, image, published, published_at) VALUES
('Dicas para Investir em Imóveis em 2024','dicas-investir-imoveis-2024','Descubra as melhores estratégias para investir no mercado imobiliário capixaba e garantir retornos expressivos.','O mercado imobiliário capixaba segue em alta. Veja como diversificar sua carteira com lotes, residenciais e comerciais...','Investimento','https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/aef83b257_generated_602b56fd.png', true, now()),
('Novos Loteamentos em Vitória e Região','novos-loteamentos-vitoria','Conheça os lançamentos mais aguardados de loteamentos na Grande Vitória para 2024.','Lançamentos exclusivos chegam à Grande Vitória este ano...','Lançamentos','https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/19bda059c_generated_b7438451.png', true, now()),
('Urbanismo Sustentável: O Futuro dos Loteamentos','urbanismo-sustentavel','Como a Universal está revolucionando o mercado com projetos que respeitam o meio ambiente.','Sustentabilidade é prioridade nos novos projetos da Universal...','Sustentabilidade','https://media.base44.com/images/public/6a01cf54d57c9f842bc3fa27/538f8366b_generated_f307108f.png', true, now());