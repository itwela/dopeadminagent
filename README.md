# Database Admin Agent

A multi-database admin interface with AI agent-ready utilities.

This project provides a unified interface for managing multiple databases with tools optimized for AI agents:

- **Convex** - Backend database and server logic
- **PostgreSQL** - Dope Core database (dope_mail_production)
- **MongoDB ATTOM** - ATTOM database (TaxAssessors)
- **MongoDB CRM** - CRM database
- [Next.js](https://nextjs.org/) for optimized web hosting and page routing
- [Tailwind](https://tailwindcss.com/) for beautiful, accessible UI
- [Convex Auth](https://labs.convex.dev/auth) for authentication

## Get started

### Installation

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Databases

### 1. PostgreSQL (Dope Core)
- **Database**: dope_mail_production
- **Test Page**: [/test-functions/dope-core](http://localhost:3000/test-functions/dope-core)
- **API Endpoints**:
  - `/api/dope-core/info` - List all tables
  - `/api/dope-core/test-connection` - Test connection
  - `/api/dope-core/test-functions` - Execute database functions
- **Documentation**: See `lib/DB_README.md`

### 2. MongoDB (ATTOM)
- **Database**: TaxAssessors
- **Test Page**: [/test-functions/attom](http://localhost:3000/test-functions/attom)
- **API Endpoints**:
  - `/api/attom/info` - List all collections
  - `/api/attom/test-connection` - Test connection
  - `/api/attom/test-functions` - Execute database functions
- **Documentation**: See `ATTOM_SETUP_SUMMARY.md` and `lib/ATTOM_README.md`

### 3. MongoDB (CRM)
- **Database**: CRM
- **Test Page**: [/test-functions/crm](http://localhost:3000/test-functions/crm)
- **API Endpoints**:
  - `/api/crm/info` - List all collections
  - `/api/crm/test-connection` - Test connection
  - `/api/crm/test-functions` - Execute database functions
- **Documentation**: See `CRM_SETUP_SUMMARY.md` and `lib/CRM_README.md`

### 4. Convex
- **Backend**: Convex database for app data
- **Dashboard**: Run `npm run dev` to access Convex dashboard

## Environment Variables

Get the environment variables from **Twezo**.

Create both a `.env` file and a `.env.local` file in the project root with the required environment variables.

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.
- [Convex Auth docs](https://labs.convex.dev/auth) for documentation on the Convex Auth library.

## Configuring other authentication methods

To configure different authentication methods, see [Configuration](https://labs.convex.dev/auth/config) in the Convex Auth docs.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
