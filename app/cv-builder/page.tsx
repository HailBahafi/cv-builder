"use client";

import { useState } from "react";
import StepUpload from "@/components/StepUpload";
import StepTemplate from "@/components/StepTemplate";
import StepJobDesc from "@/components/StepJobDesc";
import StepGenerate from "@/components/StepGenerate";
import StepPreview from "@/components/StepPreview";
import { FileText } from "lucide-react";
import Link from "next/link";
import type { AppState } from "@/types";
import { STEPS, DEFAULT_LANGUAGE } from "@/lib/constants";

export default function CVBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [appState, setAppState] = useState<AppState>({
    cvText: "",
    jobDescription: "",
    selectedTemplate: null,
    language: DEFAULT_LANGUAGE,
    generatedCV: "",
    generatedCoverLetter: "",
  });

  const updateState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }));
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStep = (step: number) => {
    if (step <= currentStep) setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">CV Builder AI</span>
          </Link>

          {/* Stepper */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                      ${isActive ? "bg-indigo-600 text-white" : ""}
                      ${isDone ? "text-indigo-600 hover:bg-indigo-50 cursor-pointer" : ""}
                      ${!isActive && !isDone ? "text-gray-400 cursor-not-allowed" : ""}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-1 ${isDone ? "bg-indigo-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="animate-fade-in">
          {currentStep === 1 && (
            <StepUpload
              state={appState}
              updateState={updateState}
              onNext={goNext}
            />
          )}
          {currentStep === 2 && (
            <StepTemplate
              state={appState}
              updateState={updateState}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepJobDesc
              state={appState}
              updateState={updateState}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepGenerate
              state={appState}
              updateState={updateState}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <StepPreview
              state={appState}
              updateState={updateState}
              onBack={goBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}