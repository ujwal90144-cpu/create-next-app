# AI Powered CSV Importer for GrowEasy CRM

This is a production-ready Full Stack SaaS application designed to accept arbitrary CSV files, intelligently map their dynamic columns into a strict GrowEasy CRM schema using Google Gemini (Gen AI), and output structured records.

## 🌟 Features

- **Intelligent Field Mapping**: Extracts and maps arbitrary columns (e.g. 'Lead', 'Customer Name', 'Client') to standard schema fields (`name`, `email`, etc.).
- **Smart Data Normalization**: 
  - Splits phone numbers into `country_code` and `mobile_without_country_code`.
  - Aggregates excess phone numbers, emails, and comments into the `crm_note` field.
  - Enforces enum values for statuses and data sources.
- **Robust CSV Processing**: Local in-browser preview parsing, followed by server-side streaming and batched AI API calls with exponential backoff retries.
- **Premium UI/UX**: Built with Next.js 15, Tailwind CSS, shadcn/ui, and Framer Motion. Features a dark-mode glassmorphism aesthetic, drag-and-drop uploads, interactive preview tables, and animated results.
- **Dockerized**: Ready for production deployments.

## 🏗 Architecture

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Table, PapaParse.
- **Backend**: Node.js, Express, TypeScript, Multer, Zod, Google Gen AI SDK, Pino logger.
- **AI Model**: `gemini-2.5-pro`

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (Optional)
- Google Gemini API Key

### Environment Setup

1. **Backend**
   Create `backend/.env`
   ```env
   PORT=5000
   LOG_LEVEL=info
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Frontend**
   Create `frontend/.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### Running Locally (Without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running with Docker

```bash
docker-compose up --build
```
Frontend will run on port `3000`, Backend on port `5000`.

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub.
2. Import project in Vercel.
3. Set Root Directory to `frontend`.
4. Add Environment Variable `NEXT_PUBLIC_API_URL` pointing to your backend URL.
5. Deploy.

### Backend (Render/Railway)
1. Push to GitHub.
2. Create a new Web Service (Render/Railway).
3. Set Root Directory to `backend`.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add Environment Variable `GEMINI_API_KEY`.
7. Deploy.

## 🔮 Future Improvements
- **Persistent Storage**: Save imported batches into a PostgreSQL database (e.g. via Prisma) instead of returning just JSON.
- **WebSockets**: Stream real-time AI mapping progress down to the frontend.
- **Authentication**: Integrate Clerk or NextAuth for multi-tenant isolation.
