# CV Builder AI

AI-powered resume and cover letter generator built with Next.js, Tailwind CSS, and Claude AI.

## Features

- 🤖 **AI-Powered**: Uses Claude AI to optimize CV content and generate tailored cover letters
- 📄 **File Upload**: Supports PDF, DOCX, and TXT file parsing
- 🎨 **9 Professional Templates**: ATS-friendly designs from classic to modern
- 💬 **Smart Chat**: Edit your CV through natural conversation with AI
- 🌍 **Multilingual**: Generate CVs in English or Arabic
- ⚡ **Fast Generation**: Get results in seconds
- 📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **AI**: [Anthropic Claude](https://anthropic.com)
- **File Parsing**: pdf-parse, mammoth
- **PDF Generation**: html2pdf.js
- **Icons**: [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_actual_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Upload CV**: Upload your existing resume or paste text directly
2. **Choose Template**: Select from 9 professional designs
3. **Add Job Description**: Paste the job you're applying for
4. **Generate**: AI creates an optimized CV and cover letter
5. **Download**: Export as PDF or chat with AI to make edits

## Project Structure

```
├── app/
│   ├── api/              # API routes for AI generation
│   ├── cv-builder/       # Main application flow
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── StepUpload.tsx
│   ├── StepTemplate.tsx
│   ├── StepJobDesc.tsx
│   ├── StepGenerate.tsx
│   ├── StepPreview.tsx
│   └── CVMiniPreview.tsx
├── lib/
│   └── constants.ts      # App constants
├── types/
│   ├── index.ts          # TypeScript types
│   ├── html2pdf.d.ts     # Module declarations
│   └── pdf-parse.d.ts
└── public/
    └── logo.svg          # Logo assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License
