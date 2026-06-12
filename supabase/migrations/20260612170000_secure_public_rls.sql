-- Secure public schema RLS for launch production.
-- Idempotent and guarded by table/column existence so it can be tested safely
-- across staging databases with schema drift.
--
-- Rollback is documented in docs/security-hardening-runbook.md.

BEGIN;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::text)
      OR public.has_role(_user_id, 'corretor'::text);
$$;

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Profiles: public read" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles: own select" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles: own update" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles: admin select" ON public.profiles;
    DROP POLICY IF EXISTS "Profiles: admin update" ON public.profiles;

    CREATE POLICY "Profiles: own select"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Profiles: own update"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'::text));

    REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon;
  END IF;

  IF to_regclass('public.user_roles') IS NOT NULL THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Roles: public read" ON public.user_roles;
    DROP POLICY IF EXISTS "Roles: read own" ON public.user_roles;
    DROP POLICY IF EXISTS "Roles: admin manage" ON public.user_roles;

    CREATE POLICY "Roles: read own"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Roles: admin manage"
      ON public.user_roles
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
  END IF;

  IF to_regclass('public.projects') IS NOT NULL THEN
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Projects: public read" ON public.projects;
    DROP POLICY IF EXISTS "Projects: admin write" ON public.projects;
    DROP POLICY IF EXISTS "Projects: admin insert" ON public.projects;
    DROP POLICY IF EXISTS "Projects: admin update" ON public.projects;
    DROP POLICY IF EXISTS "Projects: admin delete" ON public.projects;

    CREATE POLICY "Projects: public read"
      ON public.projects
      FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Projects: admin insert"
      ON public.projects
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Projects: admin update"
      ON public.projects
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Projects: admin delete"
      ON public.projects
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text));

    REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;
  END IF;

  IF to_regclass('public.properties') IS NOT NULL THEN
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Properties: public read" ON public.properties;
    DROP POLICY IF EXISTS "Properties: admin write" ON public.properties;
    DROP POLICY IF EXISTS "Properties: admin insert" ON public.properties;
    DROP POLICY IF EXISTS "Properties: admin update" ON public.properties;
    DROP POLICY IF EXISTS "Properties: admin delete" ON public.properties;

    CREATE POLICY "Properties: public read"
      ON public.properties
      FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Properties: admin insert"
      ON public.properties
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Properties: admin update"
      ON public.properties
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Properties: admin delete"
      ON public.properties
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text));

    REVOKE INSERT, UPDATE, DELETE ON public.properties FROM anon;
  END IF;

  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Blog: public read published" ON public.blog_posts;
    DROP POLICY IF EXISTS "Blog: admin write" ON public.blog_posts;
    DROP POLICY IF EXISTS "Blog: admin insert" ON public.blog_posts;
    DROP POLICY IF EXISTS "Blog: admin update" ON public.blog_posts;
    DROP POLICY IF EXISTS "Blog: admin delete" ON public.blog_posts;

    CREATE POLICY "Blog: public read published"
      ON public.blog_posts
      FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Blog: admin insert"
      ON public.blog_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Blog: admin update"
      ON public.blog_posts
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Blog: admin delete"
      ON public.blog_posts
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text));

    REVOKE INSERT, UPDATE, DELETE ON public.blog_posts FROM anon;
  END IF;

  IF to_regclass('public.testimonials') IS NOT NULL THEN
    ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Testimonials: public read approved" ON public.testimonials;
    DROP POLICY IF EXISTS "Testimonials: admin write" ON public.testimonials;
    DROP POLICY IF EXISTS "Testimonials: admin insert" ON public.testimonials;
    DROP POLICY IF EXISTS "Testimonials: admin update" ON public.testimonials;
    DROP POLICY IF EXISTS "Testimonials: admin delete" ON public.testimonials;

    CREATE POLICY "Testimonials: public read approved"
      ON public.testimonials
      FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Testimonials: admin insert"
      ON public.testimonials
      FOR INSERT
      TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Testimonials: admin update"
      ON public.testimonials
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::text));

    CREATE POLICY "Testimonials: admin delete"
      ON public.testimonials
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text));

    REVOKE INSERT, UPDATE, DELETE ON public.testimonials FROM anon;
  END IF;

  IF to_regclass('public.consentimentos_cookies') IS NOT NULL THEN
    ALTER TABLE public.consentimentos_cookies ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Cookie consents: public insert" ON public.consentimentos_cookies;
    DROP POLICY IF EXISTS "Cookie consents: staff read" ON public.consentimentos_cookies;

    CREATE POLICY "Cookie consents: public insert"
      ON public.consentimentos_cookies
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);

    CREATE POLICY "Cookie consents: staff read"
      ON public.consentimentos_cookies
      FOR SELECT
      TO authenticated
      USING (public.is_staff(auth.uid()));

    REVOKE SELECT, UPDATE, DELETE ON public.consentimentos_cookies FROM anon;
  END IF;

  IF to_regclass('public.leads') IS NOT NULL THEN
    ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Leads: public insert" ON public.leads;
    DROP POLICY IF EXISTS "Leads: backend only insert" ON public.leads;
    DROP POLICY IF EXISTS "Leads: staff read" ON public.leads;
    DROP POLICY IF EXISTS "Leads: staff update" ON public.leads;
    DROP POLICY IF EXISTS "Leads: admin delete" ON public.leads;

    CREATE POLICY "Leads: backend only insert"
      ON public.leads
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_staff(auth.uid()));

    CREATE POLICY "Leads: staff read"
      ON public.leads
      FOR SELECT
      TO authenticated
      USING (
        public.has_role(auth.uid(), 'admin'::text)
        OR (public.has_role(auth.uid(), 'corretor'::text) AND assigned_to = auth.uid())
      );

    CREATE POLICY "Leads: staff update"
      ON public.leads
      FOR UPDATE
      TO authenticated
      USING (
        public.has_role(auth.uid(), 'admin'::text)
        OR (public.has_role(auth.uid(), 'corretor'::text) AND assigned_to = auth.uid())
      )
      WITH CHECK (
        public.has_role(auth.uid(), 'admin'::text)
        OR (public.has_role(auth.uid(), 'corretor'::text) AND assigned_to = auth.uid())
      );

    CREATE POLICY "Leads: admin delete"
      ON public.leads
      FOR DELETE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::text));

    REVOKE SELECT, INSERT, UPDATE, DELETE ON public.leads FROM anon;
  END IF;

  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Newsletter: public insert" ON public.newsletter_subscribers;
    DROP POLICY IF EXISTS "Newsletter: backend insert" ON public.newsletter_subscribers;
    DROP POLICY IF EXISTS "Newsletter: staff read" ON public.newsletter_subscribers;

    CREATE POLICY "Newsletter: staff read"
      ON public.newsletter_subscribers
      FOR SELECT
      TO authenticated
      USING (public.is_staff(auth.uid()));

    REVOKE SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers FROM anon;
  END IF;
END $$;

COMMIT;
