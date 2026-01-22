# Connected Tools

<!--
UPDATE TRIGGERS:
- New MCP server added
- API integrations changed
- When user asks "what tools are connected"
- Service credentials updated
-->

## MCP Servers

| Server | Purpose | Config Location |
|--------|---------|-----------------|
| supabase-mcp | Database access, queries | ~/.mcp.json |
| [server-name] | [purpose] | [config] |

### supabase-mcp

**Capabilities:**
- Execute SQL queries
- Manage tables and schemas
- Handle RLS policies

**Usage notes:**
- [Any project-specific notes]

---

## APIs

| Service | Base URL | Auth Type | Env Var |
|---------|----------|-----------|---------|
| [Resend] | api.resend.com | API Key | `RESEND_API_KEY` |
| [Stripe] | api.stripe.com | Secret Key | `STRIPE_SECRET_KEY` |

### [Service Name]

**Purpose:** [What we use this for]

**Endpoints used:**
- `POST /endpoint` - [purpose]
- `GET /endpoint` - [purpose]

**Rate limits:** [if applicable]

**Documentation:** [link]

---

## CLI Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| supabase | Database management, migrations | `npm install -g supabase` |
| [tool] | [purpose] | [install command] |

---

## Service Credentials

> Never store actual credentials here. Only reference environment variable names.

| Service | Env Var | Where to Get |
|---------|---------|--------------|
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Project Settings > API |
| [Service] | `ENV_VAR_NAME` | [location] |

---

## Webhooks

| Source | Endpoint | Purpose |
|--------|----------|---------|
| [Stripe] | `/api/webhooks/stripe` | Payment events |

---

## Tool Integration Notes

<!-- Any project-specific notes about tool usage -->

- [Note 1]
- [Note 2]
