# 🔍 HumanAI Audit

> **Comprehensive Deterministic Linguistic & Writing Quality Analyzer**  
> Professional stylometric evaluation, readability scoring, lexical diversity measurement, and stock cliché detection for researchers, editors, and writers.

---

## 📌 Overview

**HumanAI Audit** is a deterministic linguistic audit suite engineered with a sleek, Streamlit-inspired dark interface. Unlike opaque "black-box" classifiers, HumanAI Audit computes verifiable mathematical and phonological metrics to evaluate prose quality, sentence rhythm variance (burstiness), vocabulary breadth, and synthetic repetition patterns.

The application works seamlessly across mobile, tablet, laptop, and Mac desktop displays, featuring home-page multi-format file ingestion, interactive visual document inspection, persistent user work history, and publication-ready PDF summary report generation.

---

## 🚀 Key Features

### 1. 📊 7 Deep Linguistic Analysis Modules
- **Executive Overview**: Composite Writing Quality Score (0–100) with letter grades (A+ to F), sub-score pillars (Readability, Lexical Diversity, Structural Rhythm, Clarity, Mechanics), and prioritized revision recommendations.
- **Vocabulary & Lexicon**: Type-Token Ratio (TTR), Root TTR (Guiraud), Corrected TTR, Log TTR (Herdan's C), Lexical Density (% content words), Hapax Legomena (single-occurrence terms), Dis Legomena, word length distributions, syllable breakdown, and searchable frequency spectrum with stopword filtering.
- **Readability Suite**: Authentic mathematical implementations of all 6 standard formulas:
  - Flesch Reading Ease
  - Flesch-Kincaid Grade Level (FKGL)
  - Gunning Fog Index
  - Coleman-Liau Index
  - SMOG Index (Simple Measure of Gobbledygook)
  - Automated Readability Index (ARI)
  - *Includes consensus educational grade mapping and estimated reading/speaking times.*
- **Sentence & Cadence (Burstiness)**: Sentence boundary detection protecting abbreviations (`Dr.`, `e.g.`, `U.S.`) and decimals (`3.14`), standard deviation, and Coefficient of Variation ($CV = \sigma / \mu$) to evaluate sentence length rhythm.
- **Repetition & Clichés**: Composite Repetition Index, N-gram phrase repetition extractor (Bigrams, Trigrams, 4-grams), duplicate sentence detection, consecutive opener tracking, and recurring AI stock cliché detection with concrete replacement suggestions.
- **Document Inspector**: Interactive text viewer with toggleable highlight overlays (very long sentences, punchy sentences, complex words, clichés) and a chronological **Sentence Rhythm Minimap** timeline.
- **Export & Diagnostics**: One-click generation of vector PDF summary reports, formatted Markdown briefs, raw JSON schemas, and spreadsheet-ready CSV word frequencies.

### 2. 📂 Multi-Format Document Ingestion (Home Page & Menu)
- **Direct Drag-and-Drop on Every Device**: Upload files directly on the home page or via the slide-out menu bar.
- Supported formats:
  - Plain Text (`.txt`, `.md`)
  - Microsoft Word (`.docx` via `mammoth`)
  - Adobe PDF (`.pdf` via `pdfjs-dist`)
- Instant extraction and real-time audit calculation with zero latency.

### 3. 📄 Vector PDF Summary Report Generation
- Exports a publication-ready, multi-page vector PDF containing:
  - Overall quality score, letter grade, and diagnostic verdict.
  - Complete readability table and audience targets.
  - Lexical diversity and word statistics.
  - Cadence, burstiness, and transition signpost density.
  - Stock cliché warnings and prioritized action recommendations.

### 4. 👤 User Authentication & Work History
- **Unlimited Login/Registration**: Sign in using your email ID and password without artificial constraints.
- **Automatic Audit History**: Automatically records previous documents with timestamps, scores, word counts, and snippets.
- **One-Click Restoration**: Instantly reload any historical audit back into the editor.
- **History Management**: Delete individual entries or clear all history with safety confirmation.

### 5. 📱 Universal Responsive Design & Pure Dark Mode
- **3-Lines Menu Drawer**: Prominently featured on mobile, laptop, and Mac screens to access all 7 modules, ingestion, active drafts, audit parameters, and account settings.
- **Mobile 1-Tap Horizontal Tab Bar**: Quick tab-switching right below the mobile header.
- **Permanent Streamlit Dark Palette**: Optimized contrast, subtle slate borders, and zero light/dark mode flash.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS (Streamlit-inspired high-density dark aesthetic)
- **Document Extractors**: `mammoth` (DOCX), `pdfjs-dist` (PDF)
- **PDF Generation**: `jspdf`
- **Icons**: Lucide React
- **Unit Testing**: Node.js Native Test Runner (`node:test`, `node:assert/strict`)

---

## 📐 Mathematical Formulas Implemented

- **Flesch Reading Ease**:  
  $$206.835 - 1.015 \left(\frac{\text{words}}{\text{sentences}}\right) - 84.6 \left(\frac{\text{syllables}}{\text{words}}\right)$$

- **Flesch-Kincaid Grade Level**:  
  $$0.39 \left(\frac{\text{words}}{\text{sentences}}\right) + 11.8 \left(\frac{\text{syllables}}{\text{words}}\right) - 15.59$$

- **Gunning Fog Index**:  
  $$0.4 \left[ \left(\frac{\text{words}}{\text{sentences}}\right) + 100 \left(\frac{\text{complex words}}{\text{words}}\right) \right]$$

- **Coleman-Liau Index**:  
  $$0.0588 \times L - 0.296 \times S - 15.8$$

- **Burstiness (Coefficient of Variation)**:  
  $$CV = \frac{\sigma_{\text{sentence length}}}{\mu_{\text{sentence length}}}$$

---

## 🧪 Testing

Run the automated deterministic test suite:
```bash
npx --yes tsx --test src/nlp/audit.test.ts
