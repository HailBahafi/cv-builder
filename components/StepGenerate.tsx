"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { StepProps } from "@/types";
import { extractTitle } from "@/lib/extractCvTitle";

export default function StepGenerate({ state, updateState, onNext, onBack }: StepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      // Generate CV
      const cvRes = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: state.cvText,
          jobDescription: state.jobDescription,
          mode: state.mode,
          templateId: state.selectedTemplate?.id,
          language: state.language,
        }),
      });

      const cvData = await cvRes.json();
      if (!cvRes.ok) throw new Error(cvData.error);

      // Only generate cover letter in tailor mode (requires a job description)
      let coverLetter = "";
      if (state.mode === "tailor") {
        const clRes = await fetch("/api/generate-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cvText: state.cvText,
            jobDescription: state.jobDescription,
            language: state.language,
          }),
        });
        const clData = await clRes.json();
        if (!clRes.ok) throw new Error(clData.error);
        coverLetter = clData.coverLetter;
      }

      const headline =
        extractTitle(cvData.cv) || extractTitle(state.cvText);

      updateState({
        generatedCV: cvData.cv,
        generatedTitle: headline,
        generatedCoverLetter: coverLetter,
      });

      onNext?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {state.mode === "enhance" ? "Enhance Your CV" : "Generate Your CV"}
      </h2>
      <p className="text-gray-500 mb-8">
        {state.mode === "enhance"
          ? "We'll use AI to improve your CV based on your instructions"
          : "We'll use AI to optimize your CV and create a tailored cover letter"}
      </p>

      <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            CV Length: {state.cvText.length} characters
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Template: {state.selectedTemplate?.name}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Language: {state.language === "ar" ? "Arabic" : "English"}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {state.mode === "enhance" ? "Improvement notes" : "Job Description"}: {state.jobDescription.length} characters
          </li>
        </ul>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {state.mode === "enhance" ? "Enhance CV" : "Generate CV & Cover Letter"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
