# Project Briefing

<!--
UPDATE TRIGGERS:
- Project initialization
- Tech stack changes
- New dependencies added
- Architecture decisions
- When user asks "explain the architecture", "tech stack"
-->

## Project Overview

<!-- One paragraph summary of what this project is -->

[Project name] is a [type of application] that [main purpose]. It is built for [target users] and solves [problem].

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | [e.g., Next.js] | [14.x] | [Frontend/Backend] |
| Language | [e.g., TypeScript] | [5.x] | [Type safety] |
| Database | [e.g., Supabase] | [-] | [Data persistence] |
| Styling | [e.g., Tailwind CSS] | [3.x] | [UI styling] |
| Auth | [e.g., Supabase Auth] | [-] | [Authentication] |
| Hosting | [e.g., Vercel] | [-] | [Deployment] |

## Architecture

### High-Level Overview

```
[User] --> [Frontend (Next.js)] --> [API Routes] --> [Database (Supabase)]
                                          |
                                          v
                                    [External APIs]
```

### Folder Structure

```
project/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── (auth)/         # Auth-related pages
│   │   └── (dashboard)/    # Dashboard pages
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   └── features/       # Feature-specific components
│   ├── lib/                 # Utility functions
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── tests/                   # Test files
```

### Data Flow

1. **User Request** --> Frontend component
2. **Frontend** --> API route or Server Action
3. **API/Server Action** --> Database query via Supabase client
4. **Response** --> Frontend updates state
5. **UI** --> Re-renders with new data

## Key Dependencies

| Package | Purpose | Why Chosen |
|---------|---------|------------|
| [package] | [what it does] | [why we chose it] |

## Design Patterns

### Component Pattern
<!-- How components are structured -->

### State Management
<!-- How state is managed -->

### API Pattern
<!-- How API calls are structured -->

### Error Handling
<!-- How errors are handled -->

## External Services

| Service | Purpose | Documentation |
|---------|---------|---------------|
| [Supabase] | [Database, Auth] | [link] |
| [Resend] | [Email sending] | [link] |

## Conventions

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- Types: PascalCase with suffix (`UserType`, `ApiResponse`)

### File Organization
- One component per file
- Co-locate tests with source files
- Group by feature, not by type

### Code Style
- [ESLint config]
- [Prettier config]
- [Other style guides]

## Security Considerations

- Row Level Security (RLS) enabled on all tables
- API routes validate input with Zod
- Secrets stored in environment variables only
- HTTPS enforced in production

## Performance Considerations

- [Caching strategy]
- [Image optimization]
- [Code splitting]
