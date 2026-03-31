# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (no user API key needed)
- **Auth**: Custom JWT (bcryptjs + jsonwebtoken) — replaced Replit OIDC Auth

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── sansa-ai/           # SANSA AI React web app (main product)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── replit-auth-web/    # Custom JWT auth hook (useAuth)
│   ├── integrations-openai-ai-server/  # OpenAI server-side integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## SANSA AI App

SANSA AI is an intelligent AI assistant built by Santhosh Raj (SANSA AI, Chennai, founded 30 March 2026). Supports Tamil + English, HR management, and document generation.

### Features
- **AI Chat** — Streaming responses (SSE) with real-time typing indicator
- **SANSA Identity** — Custom AI persona that identifies as SANSA, created by Santhosh Raj
- **Multi-Domain Expert (32 Domains)** — Encyclopedia/world knowledge, India expertise, government services (IAS/IPS/UPSC), business, finance/payroll (India/US/UK/Canada), HR/HRMS, law (Indian + international), technology/coding, Microsoft Office/Excel, medical/health, LinkedIn/career, translation (Tamil/English/Hindi+), space/science, e-commerce, creative arts, global country knowledge, agriculture, real estate, banking/insurance, engineering, environment, psychology, sports, cooking, travel, media, architecture/design, supply chain, mathematics/research, Tamil culture/literature, image analysis, image generation
- **Image Upload + Vision** — Upload images via paperclip button or drag & drop; AI analyzes images using GPT-5.2 vision
- **Image Generation** — AI detects image creation requests and generates images using gpt-image-1; displayed inline with download button
- **HR Mode** — 14 specializations (A-to-Z HR): recruitment, payroll, compliance, onboarding, performance, L&D, offboarding, engagement, etc.
- **Document Generation** — PDF (jsPDF), Excel (xlsx), Word (docx), PowerPoint (pptxgenjs) with styled output, auto-saved to DB
- **Document Center** — Browse, filter, re-download, and delete generated documents at `/documents`
- **Welcome Page** — 20 quick-start suggestion cards across all domains
- **Copy Button** — Copy any AI response to clipboard (appears on hover)
- **Code Highlighting** — Code blocks rendered with language labels and copy buttons
- **Search Conversations** — Search bar in sidebar filters chat history
- **Rename Conversations** — Edit chat titles via pencil icon in sidebar
- **Settings Page** — HR Mode toggle, Language selector, Light/Dark/System theme
- **Mobile Responsive** — Sidebar drawer, iOS keyboard fixes, safe-area-inset support
- **Custom JWT Auth** — Email/password registration & login with bcrypt password hashing, JWT tokens (24h expiry)
- **Admin Dashboard** — `/admin` with overview stats, user management (user/admin/special roles), conversation viewer, site configuration
- **Admin Login** — Separate admin login via environment secrets (ADMIN_USERNAME, ADMIN_PASSWORD)
- **Special Access Role** — Admin can grant "special" role for enhanced AI capabilities (deeper analysis, advanced templates)
- **Site Configuration** — Admin can edit system prompt, welcome message, and primary color via `/admin/config`
- **SEO** — Full meta tags, OG tags, canonical URL for sansaassistants.com

### Authentication System
- **User Registration**: POST /api/auth/register with email, password, firstName, lastName
- **User Login**: POST /api/auth/login with email, password
- **Admin Login**: POST /api/auth/admin-login with username, password (from ADMIN_USERNAME/ADMIN_PASSWORD env vars)
- **JWT Tokens**: 24-hour expiry, stored as httpOnly cookies + localStorage
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Middleware**: JWT verification via authMiddleware, requireAuth, requireAdmin helpers

### Admin Dashboard
- `/admin` — Overview stats (total users, conversations, messages, daily activity chart)
- `/admin/users` — User management with role assignment (user/special/admin)
- `/admin/conversations` — View all platform conversations
- `/admin/config` — Site configuration (system prompt override, welcome message, primary color)

### System Prompt
SANSA AI persona: created by Santhosh Raj, SANSA AI, Chennai. Friendly, confident, witty, professional. Never claims to be any other AI. Multi-domain expert covering 32+ areas. Special access users get enhanced capabilities (deeper analysis, advanced templates). Admin can append custom instructions via site config.

### HR Mode (14 Specializations)
When HR Mode is enabled (via `X-Hr-Mode: true` header), the system prompt activates the All-in-One HR AI Tool with dual role: "Do the Work" (templates, documents, calculations) + "Teach & Build Capability" (explain best practices). Covers: Workforce Planning, Recruitment, Interviews, Onboarding, Payroll (India), Offer Letters, HR Policies, Performance, L&D, Engagement, Attendance, Offboarding, Compliance (Indian Labour Law), HR Communication.

## API Endpoints

### Auth
- `GET /api/auth/user` — get current authenticated user
- `POST /api/auth/register` — register new user `{ email, password, firstName, lastName? }`
- `POST /api/auth/login` — login `{ email, password }`
- `POST /api/auth/admin-login` — admin login `{ username, password }`
- `POST /api/auth/logout` — logout (clears cookie)

### Chat
- `GET /api/openai/conversations` — list all conversations (auth user)
- `POST /api/openai/conversations` — create conversation `{ title: string }`
- `GET /api/openai/conversations/:id` — get conversation with messages
- `PATCH /api/openai/conversations/:id` — rename conversation `{ title: string }`
- `DELETE /api/openai/conversations/:id` — delete conversation
- `GET /api/openai/conversations/:id/messages` — list messages
- `POST /api/openai/conversations/:id/messages` — send message (SSE stream)
  - Body: `{ content: string }`
  - Headers: `X-Hr-Mode: true` for HR mode, `X-Language: Tamil` for language
  - Stream: `data: {"content":"..."}` chunks then `data: {"done":true}`

### Documents
- `GET /api/documents` — list saved documents (auth user)
- `POST /api/documents` — save document record `{ title, fileType, content, conversationId? }`
- `DELETE /api/documents/:id` — delete document

### Admin
- `GET /api/admin/stats` — dashboard statistics
- `GET /api/admin/users` — list all users
- `PATCH /api/admin/users/:id/role` — update user role `{ role: "user"|"admin"|"special" }`
- `GET /api/admin/conversations` — list all conversations
- `GET /api/admin/config` — get site configuration
- `PUT /api/admin/config` — update site config `{ systemPrompt, welcomeMessage, primaryColor }`

## Database Schema

- `users` — id, email, firstName, lastName, profileImageUrl, passwordHash, role (user/admin/special), createdAt, updatedAt
- `sessions` — sid, sess, expire (legacy, kept for compatibility)
- `conversations` — id, userId, title, createdAt
- `messages` — id, conversationId, role (user/assistant), content, createdAt
- `documents` — id, userId, conversationId, title, fileType (pdf/excel/word/ppt), content, createdAt
- `site_config` — key, value, updatedAt (stores admin-editable configuration)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for signing JWT tokens
- `ADMIN_USERNAME` — Admin login username (default: "admin")
- `ADMIN_PASSWORD` — Admin login password (default: "admin123")
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (via Replit integrations)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`. Uses bcryptjs for password hashing and jsonwebtoken for JWT auth.

### `artifacts/sansa-ai` (`@workspace/sansa-ai`)

React + Vite frontend. Uses React Query, Zustand, framer-motion, react-markdown, jsPDF, xlsx, docx, pptxgenjs.

### `lib/db` (`@workspace/db`)

Drizzle ORM with PostgreSQL. Push schema: `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval codegen. Run: `pnpm --filter @workspace/api-spec run codegen`.

## Key Files

- `artifacts/api-server/src/routes/auth.ts` — JWT auth routes (register, login, admin-login, logout)
- `artifacts/api-server/src/routes/admin.ts` — Admin API routes (stats, users, conversations, config)
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — JWT auth middleware
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify utilities
- `artifacts/api-server/src/routes/openai/conversations.ts` — AI chat + system prompt
- `lib/replit-auth-web/src/use-auth.ts` — Custom JWT auth hook (useAuth)
- `lib/db/src/schema/auth.ts` — Users, sessions, site_config tables
- `artifacts/sansa-ai/src/pages/login.tsx` — Login page
- `artifacts/sansa-ai/src/pages/register.tsx` — Registration page
- `artifacts/sansa-ai/src/pages/admin/config.tsx` — Admin site configuration page
- `artifacts/sansa-ai/src/hooks/use-document-generator.ts` — PDF/Excel/Word/PPT generation
- `artifacts/sansa-ai/src/hooks/use-chat-stream.ts` — SSE streaming hook
- `artifacts/sansa-ai/src/components/chat-message.tsx` — message rendering + copy + downloads
- `artifacts/sansa-ai/src/components/sidebar.tsx` — navigation + search + rename + user info
- `artifacts/sansa-ai/src/pages/welcome.tsx` — landing page with suggestion cards
- `artifacts/sansa-ai/src/store/use-app-store.ts` — global state (theme, HR mode, language)
- `artifacts/sansa-ai/src/assets/sansa-logo.png` — master logo (black wordmark)
