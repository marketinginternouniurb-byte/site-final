# Security hardening runbook

## Current safe point

- Base commit: `2313833`
- Working branch: `release-security-hardening`
- Local rollback tag: `pre-release-security-2313833`
- Production Worker to preserve: `site-final2`
- Rollback Worker to preserve: `site-final`
- Dedicated staging Worker to create/use: `universal-site-staging`

## Staging gate

Do not deploy until all items are true:

- `npx wrangler whoami` is authenticated.
- Staging Worker name is explicitly `universal-site-staging`.
- `wrangler.jsonc` or deploy command cannot overwrite `site-final` or `site-final2`.
- Staging has `DRY_RUN=true` or `LEAD_DRY_RUN=true`.
- Staging has test Turnstile keys.
- Staging has only staging/approved origins in `LEAD_ALLOWED_ORIGINS`.

## Required variable names

Public/runtime names only, without values:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LEAD_FORM_SECRET`
- `LEAD_ALLOWED_ORIGINS`
- `LEAD_RATE_LIMIT_MAX`
- `LEAD_RATE_LIMIT_WINDOW_MS`
- `LEAD_DRY_RUN`
- `DRY_RUN`
- `CVCRM_EMAIL`
- `CVCRM_TOKEN`
- `CVCRM_DOMAIN`
- `CVCRM_BASE_URL`
- `CVCRM_ORIGEMCV`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Manual secret rotation

CVCRM:

1. Create a new token in CVCRM.
2. Add the new token only to `universal-site-staging`.
3. Test lead submission with `DRY_RUN=true` first.
4. Test a controlled real staging flow only after approval.
5. Update production only after homologation.
6. Revoke the old token only after all consumers are confirmed.

Supabase:

1. Identify whether current consumers use legacy `service_role` or newer secret keys.
2. Add the new backend-only key to staging.
3. Confirm no private key is bundled in frontend assets.
4. Update production after staged validation.
5. Revoke the old key after all jobs/functions are confirmed.

Typebot/webhooks:

1. Inventory webhook and integration secrets.
2. Confirm whether any were exposed in history or logs.
3. Rotate gradually only after dependency owners confirm.

## RLS migration rollout

Apply only to staging first:

```bash
npx supabase db push
```

Then run anonymous and authenticated access tests:

- anonymous cannot read `profiles`;
- anonymous cannot read `user_roles`;
- anonymous cannot write/update/delete public tables;
- anonymous can read public catalog content needed by the site;
- anonymous can read only published blog posts;
- anonymous can read only approved testimonials;
- staff/admin can still use the admin panel.

## RLS rollback

Rollback must be manual and environment-specific. Do not run this in production
without approval.

```sql
drop policy if exists "Profiles: own select" on public.profiles;
drop policy if exists "Profiles: own update" on public.profiles;
drop policy if exists "Roles: read own" on public.user_roles;
drop policy if exists "Roles: admin manage" on public.user_roles;
drop policy if exists "Projects: public read" on public.projects;
drop policy if exists "Projects: admin insert" on public.projects;
drop policy if exists "Projects: admin update" on public.projects;
drop policy if exists "Projects: admin delete" on public.projects;
drop policy if exists "Properties: public read" on public.properties;
drop policy if exists "Properties: admin insert" on public.properties;
drop policy if exists "Properties: admin update" on public.properties;
drop policy if exists "Properties: admin delete" on public.properties;
drop policy if exists "Blog: public read published" on public.blog_posts;
drop policy if exists "Blog: admin insert" on public.blog_posts;
drop policy if exists "Blog: admin update" on public.blog_posts;
drop policy if exists "Blog: admin delete" on public.blog_posts;
drop policy if exists "Testimonials: public read approved" on public.testimonials;
drop policy if exists "Testimonials: admin insert" on public.testimonials;
drop policy if exists "Testimonials: admin update" on public.testimonials;
drop policy if exists "Testimonials: admin delete" on public.testimonials;
drop policy if exists "Cookie consents: public insert" on public.consentimentos_cookies;
drop policy if exists "Cookie consents: staff read" on public.consentimentos_cookies;
drop policy if exists "Leads: backend only insert" on public.leads;
drop policy if exists "Leads: staff read" on public.leads;
drop policy if exists "Leads: staff update" on public.leads;
drop policy if exists "Leads: admin delete" on public.leads;
drop policy if exists "Newsletter: staff read" on public.newsletter_subscribers;
```

If rollback is needed, restore the previous approved policy set from the last
known-good migration or database backup, not from memory.

## GitHub manual settings

- Require pull requests into `main`.
- Require CI checks from `.github/workflows/ci.yml`.
- Enable secret scanning and push protection.
- Enable Dependabot alerts and security updates.
- Keep collaborator permissions at least privilege.
