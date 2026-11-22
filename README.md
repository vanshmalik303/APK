<<<<<<< HEAD
# APKGuard — Android APK Security Analysis Platform

A modern, cybersecurity SaaS web application for static security analysis of Android APK files. Built with Next.js App Router, React, TypeScript, and Tailwind CSS.

---

## 🛡️ Core Highlights

- **5-Second Upload Onboarding**: Drag-and-drop APK upload with instant file validation (only `.apk`, max 200 MB).
- **Streamlined 3-Option Navigation**:
  1. **Upload APK** (`/`) — Hero landing page, dropzone, and live 6-stage scanning progress.
  2. **My Files** (`/files`) — APK library, status labels (`No issues detected`, `Issues Found`, `Pending`), search by filename, and delete confirmation.
  3. **Profile** (`/profile`) — Account management, security settings, heuristic scanner toggles, and session logout.
- **In-Depth Security Audit Reports** (`/reports/[id]`):
  - Transparent CVSS-weighted risk scoring meter (0-100).
  - Categorized breakdown: Critical, High, Medium, Low, Informational.
  - Distinguishes **Confirmed Observations** from **Heuristic Detections**.
  - Code evidence snippets with single-click copy, affected components, why it matters, and recommended remediations.
  - Extracted `AndroidManifest.xml` permissions with danger classification.
  - One-click **Download PDF** (custom print-optimized stylesheet) and **Export JSON**.
- **Cybersecurity Dark Palette**: Matte-black (`#090909`), sidebar (`#0D0D0D`), cards (`#151515`), and vibrant security orange (`#F97316`).
- **Backend-Ready Architecture**: Prepared for direct integration with a Python FastAPI backend via `lib/api.ts` and `NEXT_PUBLIC_API_URL`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔌 Python FastAPI Backend Integration

To connect APKGuard to your Python backend:

1. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. The frontend will automatically route the following endpoints to your FastAPI server:
   - `POST /api/upload` (multipart/form-data: `apk_file`)
   - `POST /api/scan/start` (json: `{ fileId }`)
   - `GET /api/reports/{id}`
   - `GET /api/files`
   - `DELETE /api/files/{id}`
=======
# APK
Android APK Static Security Analysis Platform
>>>>>>> 54a977d83c22fb19500301c6abfb173dc06f6343
