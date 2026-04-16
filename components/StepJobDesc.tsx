"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import type { StepProps } from "@/types";

export default function StepJobDesc({ state, updateState, onNext, onBack }: StepProps) {
  const [localDesc, setLocalDesc] = useState(state.jobDescription);

  const canProceed = localDesc.trim().length > 20;

  const handleNext = () => {
    updateState({ jobDescription: localDesc });
    onNext?.();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Description</h2>
        <p className="text-gray-500">Paste the job description to tailor your CV</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-80 p-4 border border-gray-200 rounded-2xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300 leading-relaxed"
        />
        <p className="text-xs text-gray-400">
          {localDesc.length} characters. Minimum 20 characters required.
        </p>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next — Generate CV
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
