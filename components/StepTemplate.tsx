"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { StepProps } from "@/types";
import { TEMPLATES, TEMPLATE_TAGS, TEMPLATE_BADGES } from "@/lib/constants";
import CVMiniPreview from "./CVMiniPreview";

export default function StepTemplate({ state, updateState, onNext, onBack }: StepProps) {
  const [activeTag, setActiveTag] = useState("all");

  const filtered = TEMPLATES.filter(
    (t) => activeTag === "all" || t.tag === activeTag
  );

  const canProceed = !!state.selectedTemplate;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Template</h2>
        <p className="text-gray-500">All templates are ATS-compatible</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {TEMPLATE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
              ${activeTag === tag
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {filtered.map((t) => {
          const isSelected = state.selectedTemplate?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => updateState({ selectedTemplate: t })}
              className={`relative text-left border-2 rounded-2xl overflow-hidden transition-all hover:shadow-md
                ${isSelected ? "border-indigo-600 shadow-indigo-100 shadow-lg" : "border-gray-100 hover:border-indigo-200"}`}
            >
              {isSelected && (
                <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {TEMPLATE_BADGES[t.id] && (
                <div className="absolute top-2 right-2 z-10 bg-white/90 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                  {TEMPLATE_BADGES[t.id]}
                </div>
              )}
              <div className="bg-gray-50 p-3">
                <CVMiniPreview template={t} />
              </div>
              <div className="px-3 py-2.5 border-t border-gray-100">
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.tag}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next — Job Description
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}