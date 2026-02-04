# Technology Radar - MVP Application

A modern web application for creating and visualizing interactive Technology Radars, inspired by the [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar).

## ⚠️ Project Status: Minimum Viable Product (MVP)

**This application is intended as an MVP to replace the legacy "Build Your Own Radar" tool and is designed for:**
- **Small teams** (5-10 users maximum)
- **Internal/private use** within a single organization
- **Low-traffic environments** (few radars, focused content)
- **Single-server deployments** (no horizontal scaling)

## 🎯 Design Philosophy: Focus Over Volume

**A Technology Radar is a communication tool, not a comprehensive catalog.**

### The 120 Blip Rule
- **Maximum 120 blips per radar** - This is an intentional design constraint, not a technical limitation
- Beyond 120 items, a radar becomes a directory rather than a communication tool
- If you need more than 120 blips, your radar is too broad and needs focus

### One Radar Per Organization (Recommended)
- **Most organizations should maintain only ONE radar**
- Multiple radars dilute focus and create confusion
- A single radar ensures consistent communication across the organization
- Exception: Very large enterprises with distinct business units may need separate radars

### Why Focus Matters
A Technology Radar is effective when it:
- ✅ Highlights what's **changing** or **important** right now
- ✅ Guides decision-making through clear recommendations
- ✅ Sparks conversation about technology choices
- ✅ Remains scannable and digestible in a single viewing

A Technology Radar fails when it:
- ❌ Attempts to document every technology the organization uses
- ❌ Becomes a comprehensive inventory or catalog
- ❌ Includes items that don't require active decision-making
- ❌ Takes more than 15 minutes to review and understand

**Remember**: The power of a Technology Radar comes from what you choose to **exclude**, not what you include.

### 🚫 NOT Suitable For:
- Public-facing production environments
- High-traffic websites (1000+ concurrent users)
- Enterprise-scale deployments
- Multi-tenant SaaS applications
- Applications requiring 99.9%+ uptime SLAs

### Technical Limitations:
- **SQLite database** - Not designed for high concurrency or large datasets
- **In-memory rate limiting** - Resets on server restart, not distributed
- **No horizontal scaling** - Single server instance only
- **No real-time collaboration** - Race conditions possible with concurrent edits
- **Limited error recovery** - Basic error handling without advanced monitoring

For production-scale deployments, consider migrating to PostgreSQL, Redis, and implementing proper monitoring/observability.

---

## Features

- ✅ **Multiple Radars** - Create and manage multiple technology radars
- ✅ **Interactive Visualization** - SVG-based radar with hover tooltips and click selection
- ✅ **CSV Import** - Bulk import blips from CSV files
- ✅ **Customization** - Custom quadrants, rings, colors, and blip placement
- ✅ **Authentication** - Email/password and GitHub OAuth support
- ✅ **Thoughtworks Design** - Matches official Thoughtworks Technology Radar aesthetic

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, SVG visualization
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **TypeScript**: Strict mode enabled
- **Validation**: Zod schemas

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tech-radar
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
```env
# Database (SQLite file location)
DATABASE_URL="file:./sqlite.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Usage

### Creating Your First Radar

1. Register an account at `/register` or sign in with GitHub
2. Navigate to `/dashboard`
3. Click "New Radar"
4. Customize quadrants and rings if needed
5. Add blips manually or import from CSV

### CSV Import Format

```csv
name,quadrant,ring,isNew,description
TypeScript,Languages & Frameworks,Adopt,false,Typed superset of JavaScript
React,Languages & Frameworks,Adopt,false,Component-based UI library
```

**Required columns**: `name`, `quadrant`, `ring`
**Optional columns**: `isNew` (true/false), `description`

Download a sample CSV from any radar view to see the exact format.

---

## Security Features

This MVP includes basic security features suitable for internal use:

- ✅ Rate limiting (5 requests/minute on auth endpoints)
- ✅ Password complexity requirements (12+ chars, mixed case, numbers, special chars)
- ✅ Bcrypt password hashing
- ✅ CSRF protection via NextAuth
- ✅ Input validation with Zod
- ✅ SQL injection protection via Drizzle ORM

**Note**: For production deployments, additional security hardening is required. See `docs/SECURITY_MONITORING.md` for recommendations.

---

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register)
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── radar/             # Radar detail pages
├── actions/               # Server actions
├── components/            # React components
│   ├── forms/            # Form components
│   ├── radar/            # Radar visualization
│   └── ui/               # Base UI components
├── lib/                   # Utilities and configuration
│   ├── db/               # Database schema and setup
│   ├── auth.ts           # Auth configuration
│   ├── validations.ts    # Zod schemas
│   └── radar-math.ts     # SVG geometry calculations
└── middleware.ts          # Auth middleware
```

---

## Deployment (Small Scale Only)

### Vercel (Recommended for MVP)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

**Note**: Vercel's serverless environment may have SQLite limitations. Consider using Vercel Postgres or Planetscale for better reliability.

### Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Important**: Mount SQLite database as a volume to persist data:
```bash
docker run -v ./data:/app/data -p 3000:3000 tech-radar
```

---

## Known Limitations

### Performance
- **SQLite concurrency**: Max ~10 concurrent write operations
- **No caching**: Every request hits the database
- **CSV imports**: Large files (1000+ rows) may timeout
- **No pagination**: All data loaded into memory

### Scalability
- **Single server only**: No load balancing support
- **In-memory rate limiting**: Doesn't work across multiple instances
- **No CDN**: Static assets served from app server

### Features
- **No real-time updates**: Users must refresh to see changes
- **No collaboration**: Concurrent edits may overwrite each other
- **No audit trail**: Changes not logged
- **No soft deletes**: Deletions are permanent

For production-scale requirements, consider:
- Migrating to PostgreSQL
- Adding Redis for caching and rate limiting
- Implementing real-time subscriptions
- Adding comprehensive monitoring (Sentry, Datadog)
- Implementing database transactions
- Adding full test coverage

---

## Documentation

- **Security Fixes**: `docs/SECURITY_FIXES.md` - Critical security improvements
- **Security Monitoring**: `docs/SECURITY_MONITORING.md` - Security setup guide
- **Security Policy**: `SECURITY.md` - Vulnerability reporting

---

## Contributing

This is an MVP project. For production-grade improvements:
1. Add comprehensive test suite (Jest, React Testing Library, Playwright)
2. Implement database transactions
3. Add error monitoring (Sentry)
4. Migrate to PostgreSQL
5. Add Redis for caching and rate limiting
6. Implement proper audit logging
7. Add CI/CD pipeline with security scanning

---

## License

[Add your license here]

---

## Acknowledgments

- Design inspired by [Thoughtworks Technology Radar](https://www.thoughtworks.com/radar)
- Built to replace the legacy "Build Your Own Radar" tool
- Developed with Next.js 15, React 19, and modern web technologies

---

## Support

For issues and questions:
- **Bug Reports**: Create an issue in the repository
- **Security Issues**: See `SECURITY.md` for responsible disclosure
- **Questions**: Check existing issues or create a new discussion

**Remember**: This is an MVP for internal use with small teams. Not suitable for production-scale deployments.
