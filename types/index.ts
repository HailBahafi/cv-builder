export type Language = "ar" | "en";

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
  selectedTemplate: Template | null;
  language: Language;
  generatedCV: string;
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
