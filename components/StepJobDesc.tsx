"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Wand2, Link2, Loader2 } from "lucide-react";
import type { StepProps, GenerationMode } from "@/types";

export default function StepJobDesc({ state, updateState, onNext, onBack }: StepProps) {
  const [localDesc, setLocalDesc] = useState(state.jobDescription);
  const [mode, setMode] = useState<GenerationMode>(state.mode ?? "tailor");
  const [jobUrl, setJobUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const canProceed = localDesc.trim().length > 20;

  const handleImportFromUrl = async () => {
    const trimmedUrl = jobUrl.trim();
    if (!trimmedUrl) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/import-job-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Could not import the job description from that link.");
        return;
      }
      setLocalDesc(data.text);
    } catch {
      setImportError("Something went wrong fetching that link. Please paste the description manually.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleNext = () => {
    updateState({ jobDescription: localDesc, mode });
    onNext?.();
  };

  const isTailor = mode === "tailor";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isTailor ? (
            <Briefcase className="w-7 h-7 text-indigo-600" />
          ) : (
            <Wand2 className="w-7 h-7 text-indigo-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isTailor ? "Job Description" : "Enhance Your CV"}
        </h2>
        <p className="text-gray-500">
          {isTailor
            ? "Paste the job description to tailor your CV"
            : "Describe how you want your CV improved"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setMode("tailor")}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${isTailor
              ? "border-indigo-600 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className={`w-4 h-4 ${isTailor ? "text-indigo-600" : "text-gray-500"}`} />
            <span className={`font-semibold text-sm ${isTailor ? "text-indigo-900" : "text-gray-700"}`}>
              Tailor to Job
            </span>
          </div>
          <p className="text-xs text-gray-500">Rewrite CV for a specific job description</p>
        </button>
        <button
          onClick={() => setMode("enhance")}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${!isTailor
              ? "border-indigo-600 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Wand2 className={`w-4 h-4 ${!isTailor ? "text-indigo-600" : "text-gray-500"}`} />
            <span className={`font-semibold text-sm ${!isTailor ? "text-indigo-900" : "text-gray-700"}`}>
              Enhance CV
            </span>
          </div>
          <p className="text-xs text-gray-500">Improve your CV based on your own instructions</p>
        </button>
      </div>

      {isTailor && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or paste a job posting link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleImportFromUrl();
                }
              }}
              placeholder="https://company.com/careers/job-posting..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300"
            />
            <button
              onClick={handleImportFromUrl}
              disabled={!jobUrl.trim() || isImporting}
              className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Import
            </button>
          </div>
          {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}
          <p className="text-xs text-gray-400 mt-2">
            We&apos;ll fetch and fill the text below so you can check it&apos;s correct — sites like LinkedIn
            that require login usually can&apos;t be auto-imported, so paste manually in that case.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {isTailor ? "Job Description" : "What should we improve?"}
        </label>
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          placeholder={
            isTailor
              ? "Paste the job description here..."
              : "e.g. Make the summary more concise, strengthen action verbs in experience bullets, add quantified metrics, improve ATS keywords for frontend roles..."
          }
          className="w-full h-72 p-4 border border-gray-200 rounded-2xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300 leading-relaxed"
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
          Next — {isTailor ? "Generate CV" : "Enhance CV"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
