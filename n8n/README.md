# ViralFlow AI - n8n Integration Guide

This guide explains how to set up, configure, and connect your **n8n orchestration workflows** with the Next.js frontend, Supabase database, and local Video Render Worker.

---

## 🔗 The Orchestration Framework

n8n serves as the central hub. Every key step communicates using HTTP webhook requests or database triggers to keep the system loosely coupled and highly robust.

```
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│ Next.js Frontend│ ◄──[Auth]──► │    Supabase     │ ◄──[Sync]──► │  n8n Workflows  │
│  (Port 3000)    │             │   (Database)    │             │  (Self-Hosted)  │
└────────┬────────┘             └────────▲────────┘             └────────┬────────┘
         │                               │                               │
   [POST Webhook]                        │                         [POST Render]
         │                               │                               │
         ▼                               │                               ▼
┌─────────────────┐                      │                      ┌─────────────────┐
│   n8n Webhook   │ ─────────────────────┘                      │  Render Worker  │
│  (Trigger Node) │                                             │   (Port 5000)   │
└─────────────────┘                                             └─────────────────┘
```

---

## ⚙️ Environment Variables Required in n8n

Ensure your n8n container or instance has these environment variables or credentials configured:
1. **SUPABASE_URL**: Your Supabase project URL (e.g., `https://your-proj.supabase.co`).
2. **SUPABASE_SERVICE_ROLE_KEY**: Service role token (bypasses RLS to write trends/scores).
3. **OPENROUTER_API_KEY**: Credentials for routing requests to LLM agents.
4. **PEXELS_API_KEY**: Required to retrieve B-roll clip download URLs.
5. **RENDER_WORKER_URL**: URL of your render worker (defaults to `http://localhost:5000` or Docker network alias).

---

## 🛠️ n8n Sub-Workflow Details

Import the workflow templates from [workflows_import.json](./workflows_import.json) and configure these key nodes:

### 1. Workflow: Trend Ingestion (`Trend Scanner`)
* **Trigger**: `Schedule Trigger` (set to fire every 30 minutes).
* **Step A**: HTTP Request node calling YouTube Data API `search` endpoint with query terms fetched from active Niche variables.
* **Step B**: Deduplicator (Code node) checking if `external_id` already exists in Supabase.
* **Step C**: Supabase Insert node adding new trends into the `trends` table.

### 2. Workflow: Trend Analyzer & LLM Scorer (`Trend Analyzer`)
* **Trigger**: Supabase Trigger node detecting new insertions in the `trends` table.
* **Step A**: Fetch active creator profile from `creators` table.
* **Step B**: LLM node (OpenRouter API) querying a fast reasoning model to evaluate Momentum, Creator Fit, Saturation, and Novelty based on Creator DNA.
* **Step C**: Calculate overall opportunity score in a Code node using weights.
* **Step D**: Supabase Upsert node adding calculations to `trend_scores` table.

### 3. Workflow: Content Factory (`Content Factory`)
* **Trigger**: n8n Webhook node (`POST /webhook/content/generate`) called from Frontend Script Studio.
* **Step A**: LLM Strategy Agent chooses the unique angle, CTA, hook, and outlines the scene plan (outputs JSON).
* **Step B**: LLM Fact Checker extracts statements, queries Search sources, and returns verification verdicts.
* **Step C**: HTTP Request node calling Pexels API (`GET /videos/search`) with scene keywords.
* **Step D**: Supabase Insert node adding script scenes to `scripts` table and setting Content Idea status to `'rendering'`.
* **Step E**: HTTP Request node calling the **Video Render Worker** (`POST http://localhost:5000/render`) with the compiled scene manifest.

### 4. Workflow: Publishing & Post-Execution (`Publisher & Analytics`)
* **Trigger**: HTTP Webhook approval gate called when creator clicks **Approve & Publish** on the Next.js Dashboard.
* **Step A**: Retrieve rendering URL from Supabase.
* **Step B**: Call YouTube Data API `videos.insert` node using Creator's OAuth tokens to upload the MP4.
* **Step C**: Save returned Post ID to `publishes` table.
* **Step D**: Schedule a delay node (24 hours) then pull view counts to generate learnings and update Creator DNA version.
