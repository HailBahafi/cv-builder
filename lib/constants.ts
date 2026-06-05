import { FileText, Layout, Briefcase, Sparkles, Eye } from "lucide-react";
import type { Template, StepInfo, Feature, ProcessStep } from "@/types";

export const STEPS: StepInfo[] = [
  { id: 1, label: "Upload CV", icon: FileText },
  { id: 2, label: "Template", icon: Layout },
  { id: 3, label: "Job Details", icon: Briefcase },
  { id: 4, label: "Generate", icon: Sparkles },
  { id: 5, label: "Preview", icon: Eye },
];

export const TEMPLATES: Template[] = [
  { id: "executive", name: "Executive Pro", tag: "classic", accent: "#1e3a5f", header: "#1e3a5f" },
  { id: "double-column", name: "Double Column", tag: "modern", accent: "#4f46e5", header: "#1a1a2e" },
  { id: "elegant", name: "Elegant", tag: "classic", accent: "#0f6e56", header: "#0f6e56" },
  { id: "modern", name: "Modern", tag: "modern", accent: "#d85a30", header: "#d85a30" },
  { id: "creative", name: "Creative", tag: "creative", accent: "#7f77dd", header: "#3c3489" },
  { id: "timeline", name: "Timeline", tag: "modern", accent: "#185fa5", header: "#042c53" },
  { id: "polished", name: "Polished", tag: "classic", accent: "#3b6d11", header: "#27500a" },
  { id: "compact", name: "Compact", tag: "compact", accent: "#64748b", header: "#1e293b" },
  { id: "high-performer", name: "High Performer", tag: "modern", accent: "#ba7517", header: "#412402" },
  { id: "stylish", name: "Stylish", tag: "creative", accent: "#1d9e75", header: "#085041" },
];

export const TEMPLATE_TAGS = ["all", "modern", "classic", "creative", "compact"] as const;

export const TEMPLATE_BADGES: Record<string, string> = {
  "executive": "Most Popular",
  "double-column": "Modern",
  "elegant": "Professional",
  "modern": "Modern",
  "creative": "Unique",
  "timeline": "Distinctive",
  "compact": "One Page",
  "high-performer": "Results",
};

export const PROCESS_STEPS: ProcessStep[] = [
  { step: "1", icon: "📄", title: "Upload CV", desc: "Upload your existing resume (PDF or DOCX) or start from scratch" },
  { step: "2", icon: "🎨", title: "Choose Template", desc: "Select from 10 professional ATS-friendly designs" },
  { step: "3", icon: "✨", title: "AI Generation", desc: "AI optimizes content and writes a cover letter automatically" },
  { step: "4", icon: "⬇️", title: "Download", desc: "Save your CV and cover letter as ATS-ready DOCX or PDF" },
];

export const FEATURES: Feature[] = [
  { icon: "🎯", title: "ATS Optimized", desc: "All templates are designed to pass Applicant Tracking Systems" },
  { icon: "🌍", title: "Multilingual", desc: "Generate CVs in Arabic or English based on job requirements" },
  { icon: "💬", title: "Smart Chat", desc: "Talk to AI to modify any part of your CV instantly" },
  { icon: "📝", title: "Cover Letter", desc: "Generate tailored cover letters for each job automatically" },
  { icon: "🎨", title: "10 Templates", desc: "From classic to modern, there's a design for every professional" },
  { icon: "⚡", title: "Lightning Fast", desc: "Get a complete CV in seconds, not hours" },
];

export const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

export const DEFAULT_LANGUAGE = "en" as const;

export interface ExternalProjectLink {
  href: string;
  label: string;
}

/** Related projects — opens in a new tab when clicked. */
export const PROJECT_EXTERNAL_LINKS: ExternalProjectLink[] = [
  { href: "https://www.coffeeclubsa.com/", label: "Hollywood Coffee Club" },
  { href: "https://infinity.edu.sa/", label: "Infinity Education" },
  { href: "https://algothmi.vercel.app/", label: "Algothmi" },
];

export const MIN_CV_LENGTH = 50;
