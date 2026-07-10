# GrowEasy AI CSV Importer

An AI-powered CSV importer that intelligently extracts and maps CRM lead information from any valid CSV layout or column structure. Built using Next.js, Node.js/Express, and the Groq Llama 3.1 AI inference pipeline.

---

### 🌐 Hosted URL
* **Hosted Application URL**: [Add your Vercel frontend URL here](https://groweasy-csv-importer-coral.vercel.app/)
* **GitHub Repository**: [https://github.com/IqraKhanZ/groweasy-csv-importer](https://github.com/IqraKhanZ/groweasy-csv-importer)

---

## 🚀 Key Features

* **Intelligent AI Field Mapping**: Automatically maps arbitrary column names (e.g., `"Full Name"`, `"contact_name"`, `"Client"`) to standard CRM fields.
* **Groq Llama 3.1 Pipeline**: Configured to run on the free, fast `llama-3.1-8b-instant` model. Supports easy swapping to OpenAI, Gemini, or Claude.
* **Batch Processing & Retries**: Processes CSV records in batches of 25 with automatic backoff retry intervals (`1000ms`, `3000ms`, `7000ms`) on extraction failures.
* **Rich CSV Parser Rules**: Handles multiple emails/phones by appending extras to `crm_note` with proper delimiters. Fills missing dates automatically with server timestamps.
* **PDF Export**: Allows downloading successfully processed records in a clean, print-friendly PDF format immediately.
* **Clean UI & Dark Theme**: Premium WFH-style dark theme built with Tailwind CSS. Includes visual step wizards, count-up animations, and inline previews.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), Tailwind CSS, PapaParse
* **Backend**: Node.js, Express, TypeScript, Multer, OpenAI/Groq SDKs
* **Docker**: Full multi-stage builds and unified orchestration with `docker-compose`

---

## 📂 Project Structure

```
groweasy-csv-importer/
├── backend/                  # Node.js/Express service
│   ├── src/                  # Controllers, Middlewares, Services
│   ├── tests/                # Jest integration and unit test suites
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/                 # Next.js frontend client
│   ├── app/                  # globals.css, stepper view, layout
│   ├── components/           # UploadDropzone, ResultTable, PDF export
│   └── Dockerfile
└── docker-compose.yml        # Orchestration layer
```

---

## 💻 Local Setup Instructions

Ensure you have [Node.js (v18+)](https://nodejs.org) installed.

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Set your Groq API key:
   ```env
   PORT=4000
   AI_PROVIDER=groq
   AI_API_KEY=<your-groq-api-key>
   AI_MODEL=llama-3.1-8b-instant
   CORS_ORIGIN=http://localhost:3000
   ```
4. Install packages and start the backend:
   ```bash
   npm install
   npm run dev
   ```
   *Backend will run at:* `http://localhost:4000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.local.example .env.local
   ```
3. Verify the API base URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ```
4. Install packages and run Next.js:
   ```bash
   npm install
   npm run dev
   ```
   *Frontend will run at:* `http://localhost:3000`

---

## 🐳 Running with Docker

You can spin up both services with one command using Docker:

1. Copy the `.env` template in the backend directory.
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```

---

## 🧪 Running Backend Tests

The backend includes 57 integration and unit tests covering parsers, filters, validation boundaries, and mocked AI mapping:

```bash
cd backend
npm test
```
