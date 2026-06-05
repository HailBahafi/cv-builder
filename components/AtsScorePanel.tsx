"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Target } from "lucide-react";
import type { Language } from "@/types";

interface AtsResult {
  score: number;
  matched: string[];
  missing: string[];
  suggestions: string[];
  summary: string;
}

interface AtsScorePanelProps {
  cv: string;
  jobDescription: string;
  language: Language;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}

export default function AtsScorePanel({ cv, jobDescription, language }: AtsScorePanelProps) {
  const [result, setResult] = useState<AtsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAr = language === "ar";

  const analyze = useCallback(async () => {
    if (!cv || !jobDescription) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: cv, jobDescription, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze");
    } finally {
      setLoading(false);
    }
  }, [cv, jobDescription, language]);

  // Run once when the CV first becomes available. Deferred to a microtask so we
  // don't call setState synchronously inside the effect body.
  useEffect(() => {
    const id = setTimeout(analyze, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = result ? scoreColor(result.score) : "#94a3b8";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          {isAr ? "تقييم ATS" : "ATS Match Score"}
        </h3>
        <button
          onClick={analyze}
          disabled={loading}
          title={isAr ? "إعادة التحليل" : "Re-analyze"}
          className="text-gray-400 hover:text-indigo-600 disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !result && (
        <div className="flex flex-col items-center gap-2 py-8 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <p className="text-sm">{isAr ? "جارٍ تحليل التطابق..." : "Analyzing match..."}</p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Score gauge */}
          <div className="flex items-center gap-4">
            <div
              className="relative w-20 h-20 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `conic-gradient(${color} ${result.score * 3.6}deg, #e5e7eb 0deg)` }}
            >
              <div className="absolute inset-1.5 bg-white rounded-full flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color }}>{result.score}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-snug">{result.summary}</p>
          </div>

          {result.matched.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                {isAr ? "كلمات مطابقة" : "Matched keywords"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k, i) => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {isAr ? "كلمات مفقودة" : "Missing keywords"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k, i) => (
                  <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {isAr ? "اقتراحات للتحسين" : "Suggestions"}
              </p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-indigo-500 shrink-0">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
