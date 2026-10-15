# MTNShade Mug Studio

- `src/` — editable source (studio + CRM + MTNShade design tokens + assets)
- `build.mjs` — builds `dist/` (Netlify runs it on every push)
- `netlify/` — serverless backend (Stripe checkout, order capture, CRM API)
- `CLAUDE.md` — full context for Claude Code: business rules, file map, data model, workflows

Deploy: push to `main`. Env vars: `STRIPE_SECRET_KEY`, `CRM_PASSWORD`.
