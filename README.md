# ViralFlow AI

> **Autonomous AI Content Discovery, Creation, Publishing & Learning Platform**

ViralFlow AI is an end-to-end autonomous content-operations platform designed to give individual creators an always-on content team: a trend researcher, content strategist, scriptwriter, fact-checker, video editor, publisher, and performance analyst working as a single coordinated system.

Instead of just generating generic videos, ViralFlow AI closes the loop by analyzing how published videos perform, updating the **Creator DNA**, and using those insights to decide what topic the creator should cover next.

---

## 🔄 The Core Product Loop

```
  Creator Profile / DNA
          │
          ▼
   Trend Discovery ──► Ingests YouTube & RSS feeds
          │
          ▼
   Trend Analysis ──► LLM scores momentum & creator fit
          │
          ▼
  Content Strategy ──► Decides angle, hook, and scene plan
          │
          ▼
  Video Production ──► Voiceover (TTS) + Captions (Whisper) + B-Roll (Pexels)
          │
          ▼
  Video Rendering ──► Auto-assembler (FFmpeg / Remotion)
          │
          ▼
    Approval Gate ──► Creator reviews & approves on Dashboard
          │
          ▼
  Publish & Measure ──► Uploads to YouTube/TikTok + Collects Analytics
          │
          ▼
   Learning Engine ──► Feeds insights back to update Creator DNA
```

---

## 🎨 Premium Obsidian Design & Aesthetics
* **Space Black & Silver Theme**: Default dark theme features an ultra-premium Obsidian black background (`#000000`) and surface card panels (`#121212`), matched with clean metal-grey borders (`#262626`) and silver typography accents (`#e5e5e5` and `#ffffff`).
* **Light Theme Continuity**: Keeps the default light mode overrides (slate-white and clean indigo) fully intact for high-ambient environments.
* **Translucent Mobile Header**: Supports a translucent, glassmorphic header bar (`height: 60px`) on mobile viewports with a native `blur(12px)` backdrop-filter overlay.

---

## 🛠️ Tech Stack & Tools Used

### 1. Automation & Orchestration (n8n Integration)
* **n8n Community Suite**: The central orchestrator. It manages API requests, controls conditional logic, and imports active AI models:
  * **Trend Ingestion & Script Drafting**: `google/gemini-1.5-pro` (via OpenRouter API).
  * **Voice Synthesis Engine**: `ElevenLabs Multilingual v2` (Cloned Voice).
* **Remotion / FFmpeg**: Renders scenes, crops to 9:16 vertical layout, mixes cloned voice narration, overlays captions, and outputs the final MP4.

### 2. Database & Authentication
* **Supabase (PostgreSQL)**: Handles the relational data model (creators, trends, scripts, asset links, analytics logs).
* **Supabase Auth**: Manages signups, logins, and secure user routing.
* **Row-Level Security (RLS)**: Enforces privacy so creators only see their own content.

### 3. Frontend UI
* **Next.js (App Router & TypeScript)**: Structured for modular route rendering.
* **Vanilla CSS**: Responsive layouts across Mobile, Tablet, Laptop, and PC screens.
* **Hydration Protection**: Utilizes theme initialization script bypasses (`suppressHydrationWarning`) to prevent flashing during load states.

---

## 📁 Project Directory Structure

```
├── n8n/                      # n8n workflows schemas
│   ├── README.md             # Setup guide
│   └── workflows_import.json # Ingest workflows (YouTube Search API, Supabase nodes)
├── src/
│   ├── app/                 # Next.js App Router folders
│   │   ├── layout.tsx       # Root layout, HTML, and Theme initialization
│   │   ├── page.tsx         # Landing page (Features list, Pricing plans, Contact form)
│   │   ├── blog/            # Blog Insights hub (Mock articles on pipelines, voice, & factchecks)
│   │   ├── login/           # Creator login form (Dynamic session routing)
│   │   ├── signup/          # Creator registration portal
│   │   ├── onboarding/      # Creator DNA Wizard (Niche, Tone, Audience)
│   │   ├── dashboard/       # Main Creator workspace (Trend Radar, Strategy Lab, approvals)
│   │   ├── editor/[id]/     # Script timeline editor & factchecking panel
│   │   └── admin/           # Admin operator console (Quotas, n8n models check, provider swaps)
│   ├── components/          # Reusable UI widgets
│   │   ├── Sidebar.tsx      # Sidebar Navigation with close toggle & center-logo transition
│   │   ├── ThemeToggle.tsx  # Dark/Light selector
│   │   └── VideoPreview.tsx # 9:16 vertical video player mockup
│   └── lib/
│       └── supabase.ts      # Instantiated Supabase JS Client & config checkers
├── supabase_schema.sql      # Database migrations (RLS triggers, tables schemas)
└── README.md                # Project documentation (this file)
```

---

## 🌟 Interactive Layout & Navigation Features
* **Landing Page Nav Links**: Top navigation header bar supports quick scroll triggers to **Pricing** plans and **Contact Us** forms, alongside a link to the **Blog**.
* **Dynamic Login States**: Recognizes active browser sessions to swap between "Sign In / Get Started" and "Status: Logged In / Launch Studio" buttons automatically.
* **Sidebar Collapse System**: The left navigation sidebar can be collapsed to slide completely off-screen on desktop viewports. When collapsed:
  * The main viewport padding is adjusted to fill the screen width.
  * A fixed top header bar is rendered, automatically centering the brand logo in the middle of the screen.
  * A hamburger menu button is provided on the left to restore the expanded sidebar layout.

---

## 🔒 Security & Privacy Practices
* **Zero Hardcoded Keys**: All API tokens (OpenRouter, Pexels, Supabase credentials) are stored securely inside n8n Credentials or Vercel environment variables.
* **Least Privilege OAuth**: Users authorize channel management scopes only for automated uploads.
* **Likeness Protection**: Avatar or voice synthesis pipelines only process verified, creator-provided footage.
