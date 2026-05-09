"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Download, MessageSquare, Send, Loader2, FileText } from "lucide-react";
import type { StepProps, ChatMessage } from "@/types";
import CVRenderer from "./CVRenderer";
import CoverLetterPreview from "./CoverLetterPreview";
import { extractTitle } from "@/lib/extractCvTitle";

export default function StepPreview({ state, updateState, onBack }: StepProps) {
  const [activeTab, setActiveTab] = useState<"cv" | "cover">("cv");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const source = activeTab === "cv" ? cvRef.current : coverRef.current;
    if (!source) return;
    setIsDownloading(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: [10, 15, 10, 15] as [number, number, number, number],
          filename: activeTab === "cv" ? "cv.pdf" : "cover-letter.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc: Document) => {
              // Strip every stylesheet (Tailwind v4 uses lab()/oklch() which html2canvas can't parse)
              clonedDoc
                .querySelectorAll('link[rel="stylesheet"], style')
                .forEach((n) => n.remove());
              // Clear CSS custom properties + classes that reference those colors
              clonedDoc.documentElement.setAttribute("style", "color-scheme: light");
              clonedDoc.documentElement.className = "";
              clonedDoc.body.className = "";
              clonedDoc.body.setAttribute(
                "style",
                "background:#fff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#111"
              );
              // Inject a minimal reset that won't use lab/oklch
              const reset = clonedDoc.createElement("style");
              reset.textContent =
                "*,*::before,*::after{box-sizing:border-box}" +
                "img{max-width:100%;height:auto}";
              clonedDoc.head.appendChild(reset);
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(source)
        .save();
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: chatInput },
    ];
    setChatHistory(newHistory);
    setChatInput("");
    setIsChatting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatInput,
          currentCV: state.generatedCV,
          currentCoverLetter: state.generatedCoverLetter,
          history: chatHistory,
          language: state.language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setChatHistory([...newHistory, { role: "assistant", content: data.response }]);

      if (data.updatedCV) {
        const headline =
          extractTitle(data.updatedCV) || extractTitle(state.cvText);
        updateState({
          generatedCV: data.updatedCV,
          generatedTitle: headline,
        });
      }
      if (data.updatedCoverLetter) {
        updateState({ generatedCoverLetter: data.updatedCoverLetter });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process";
      setChatHistory([...newHistory, { role: "assistant", content: `Error: ${msg}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("cv")}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${activeTab === "cv"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-600 border border-gray-200"
            }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          CV
        </button>
        {state.mode !== "enhance" && (
          <button
            onClick={() => setActiveTab("cover")}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${activeTab === "cover"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 border border-gray-200"
              }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Cover Letter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
            <div ref={cvRef} className={activeTab === "cv" ? "" : "hidden"}>
              <CVRenderer
                content={state.generatedCV}
                template={state.selectedTemplate}
                headlineTitle={state.generatedTitle}
                language={state.language}
              />
            </div>
            <div ref={coverRef} className={activeTab === "cover" ? "" : "hidden"}>
              <CoverLetterPreview
                content={state.generatedCoverLetter}
                language={state.language}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="w-5 h-5" /> Download as PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col h-[600px]">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Ask AI to Edit
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatHistory.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Ask AI to modify your CV or cover letter
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm ${msg.role === "user"
                  ? "bg-indigo-50 text-indigo-900 ml-4"
                  : "bg-gray-100 text-gray-700 mr-4"
                  }`}
              >
                {msg.content}
              </div>
            ))}
            {isChatting && (
              <div className="bg-gray-100 text-gray-700 mr-4 p-3 rounded-xl text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
              placeholder="e.g., Add more skills..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleChat}
              disabled={isChatting || !chatInput.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
