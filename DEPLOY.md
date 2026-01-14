# Friend Community Deployment Guide

## Setup Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Ensure `.env.local` contains your `DATABASE_URL` (Postgres).
   Also add a `JWT_SECRET` for session encryption:
   ```env
   JWT_SECRET="complex_secret_key_here"
   DATABASE_URL="..."
   ```

3. **Database Setup**:
   Push the schema to your database:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel Dashboard**:
   - Import the repository.
   - The Framework Preset should be **Next.js**.
   - **Environment Variables**:
     - `DATABASE_URL`: (Your Vercel Postgres connection string)
     - `JWT_SECRET`: (Generate a strong secret)
   - Deploy.

3. **Post-Deployment**:
   Prisma Client is automatically generated during `next build` on Vercel.
