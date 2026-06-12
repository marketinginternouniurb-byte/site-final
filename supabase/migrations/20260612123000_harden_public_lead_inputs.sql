-- Harden public lead/newsletter input without changing telephone handling.
-- The production database currently may not have both legacy tables. Each block
-- is guarded so the migration is safe across environments.

DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'leads_name_length_chk'
    ) THEN
      EXECUTE '
        ALTER TABLE public.leads
          ADD CONSTRAINT leads_name_length_chk
          CHECK (char_length(btrim(name)) BETWEEN 2 AND 160) NOT VALID
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_format_chk'
    ) THEN
      EXECUTE '
        ALTER TABLE public.leads
          ADD CONSTRAINT leads_email_format_chk
          CHECK (
            char_length(email) <= 220
            AND email ~* ''^[^@\s]+@[^@\s]+\.[^@\s]+$''
          ) NOT VALID
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'leads_message_length_chk'
    ) THEN
      EXECUTE '
        ALTER TABLE public.leads
          ADD CONSTRAINT leads_message_length_chk
          CHECK (message IS NULL OR char_length(message) <= 2000) NOT VALID
      ';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'leads'
        AND column_name = 'notes'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'leads_notes_length_chk'
    ) THEN
      EXECUTE '
        ALTER TABLE public.leads
          ADD CONSTRAINT leads_notes_length_chk
          CHECK (notes IS NULL OR char_length(notes) <= 2000) NOT VALID
      ';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS "Leads: public insert" ON public.leads';
    EXECUTE '
      CREATE POLICY "Leads: public insert"
      ON public.leads
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        public.is_staff(auth.uid())
        OR (
          char_length(btrim(name)) BETWEEN 2 AND 160
          AND char_length(email) <= 220
          AND email ~* ''^[^@\s]+@[^@\s]+\.[^@\s]+$''
          AND (message IS NULL OR char_length(message) <= 2000)
          AND status = ''novo''::public.lead_status
          AND assigned_to IS NULL
          AND notes IS NULL
        )
      )
    ';

    EXECUTE 'REVOKE SELECT ON public.leads FROM anon';
  END IF;

  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_email_format_chk'
    ) THEN
      EXECUTE '
        ALTER TABLE public.newsletter_subscribers
          ADD CONSTRAINT newsletter_email_format_chk
          CHECK (
            char_length(email) <= 220
            AND email ~* ''^[^@\s]+@[^@\s]+\.[^@\s]+$''
          ) NOT VALID
      ';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS "Newsletter: public insert" ON public.newsletter_subscribers';
    EXECUTE '
      CREATE POLICY "Newsletter: public insert"
      ON public.newsletter_subscribers
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        char_length(email) <= 220
        AND email ~* ''^[^@\s]+@[^@\s]+\.[^@\s]+$''
      )
    ';

    EXECUTE 'REVOKE SELECT ON public.newsletter_subscribers FROM anon';
  END IF;
END $$;
