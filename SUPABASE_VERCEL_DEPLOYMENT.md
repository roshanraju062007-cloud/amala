# Supabase and Vercel Deployment Guide

This document provides step-by-step instructions on how to provision your Supabase Native database and deploy your application to Vercel.

## 1. Supabase Execution (Database Setup)

We have generated a fully native Supabase schema that includes Row Level Security (RLS) policies, Realtime configuration, and a seed Admin user.

### Steps to execute the schema:
1. Go to your [Supabase Dashboard](https://app.supabase.com/) and create a new project (or open an existing one).
2. Navigate to the **SQL Editor** from the left sidebar.
3. Click on **New Query**.
4. Open the `database/supabase_schema.sql` file in your code editor, copy its entire contents, and paste it into the Supabase SQL Editor.
5. Click **Run** (or press `Cmd/Ctrl + Enter`).
6. **Success!** Your database tables, RLS policies, realtime publications, and a seed admin user (`admin@amala.edu` / `admin123`) are now provisioned.

### Retrieve Supabase Credentials:
To connect your backend/frontend, you need your project keys.
1. In the Supabase Dashboard, go to **Project Settings -> API**.
2. Copy the **Project URL**.
3. Copy the **anon** `public` API key.
4. (Optional, if required for secure backend operations bypassing RLS): Copy the **service_role** `secret` API key. 

Save these to use as Environment Variables in Vercel.

---

## 2. Vercel Integration (Deployment)

Vercel is an excellent platform for deploying Node.js (Express) backends and modern web frontends. 

### Preparing the Project for Vercel

If your backend is an Express application, Vercel requires a `vercel.json` file to route traffic properly to your serverless functions. 

1. Ensure you have a `vercel.json` in your project root with the following configuration to handle Express routing:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

2. Make sure your `package.json` includes `express` and other dependencies. We have cleaned out the old `embedded-postgres` scripts.

### Deploying via Vercel CLI or Dashboard

**Option A: Using Vercel Dashboard (GitHub Integration)**
1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New... -> Project**.
3. Import your GitHub repository.
4. **Environment Variables**: Before deploying, add the following Environment Variables in the Vercel UI:
   - `SUPABASE_URL` (Your Supabase Project URL)
   - `SUPABASE_ANON_KEY` (Your Supabase Anon Key)
   - `JWT_SECRET` (If you are still using custom JWTs, or your Supabase JWT secret)
5. Click **Deploy**. Vercel will automatically build and host your API.

**Option B: Using Vercel CLI**
1. Install the CLI: `npm i -g vercel`
2. Run `vercel` in your project directory.
3. Follow the prompts to set up the project.
4. Add your environment variables when prompted or via the dashboard later.
5. Once complete, run `vercel --prod` to push to production.

> [!IMPORTANT]
> **Security Reminder**
> Your `.env` and `.env.*` files have been added to `.gitignore`. Never commit these files. Always add your production keys directly via the Vercel Dashboard settings.
