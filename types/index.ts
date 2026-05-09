export type Language = "ar" | "en";
export type GenerationMode = "tailor" | "enhance";

export interface Template {
  id: string;
  name: string;
  tag: string;
  accent: string;
  header: string;
} 

export interface AppState {
  cvText: string;
  jobDescription: string;
  mode: GenerationMode;
  selectedTemplate: Template | null;
  language: Language;
  generatedCV: string;
  /** Headline from last ### in generated CV; falls back to markdown when empty. */
  generatedTitle: string;
  generatedCoverLetter: string;
}

export interface StepProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export interface StepInfo {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export interface ProcessStep {
  step: string;
  icon: string;
  title: string;
  desc: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
