"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Download, MessageSquare, Send, Loader2, FileText, ChevronDown, FileType, Image as ImageIcon } from "lucide-react";
import { saveAs } from "file-saver";
import type { StepProps, ChatMessage } from "@/types";
import CVRenderer from "./CVRenderer";
import CoverLetterPreview from "./CoverLetterPreview";
import AtsScorePanel from "./AtsScorePanel";
import { extractTitle } from "@/lib/extractCvTitle";
import { buildCvPdfBlob, buildCoverLetterPdfBlob } from "@/lib/exportPdf";
import { buildCvDocxBlob, buildCoverLetterDocxBlob } from "@/lib/exportDocx";

export default function StepPreview({ state, updateState, onBack }: StepProps) {
  const [activeTab, setActiveTab] = useState<"cv" | "cover">("cv");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAr = state.language === "ar";

  // Close the download menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const baseName = activeTab === "cv" ? "cv" : "cover-letter";

  // ATS-friendly DOCX (real text, single column) — best for ATS, both languages.
  const handleDownloadDocx = async () => {
    setMenuOpen(false);
    setIsDownloading(true);
    try {
      const blob =
        activeTab === "cv"
          ? await buildCvDocxBlob(state.generatedCV, state.generatedTitle, state.language)
          : await buildCoverLetterDocxBlob(state.generatedCoverLetter, state.language);
      saveAs(blob, `${baseName}.docx`);
    } catch (err) {
      console.error("DOCX export failed:", err);
      alert("DOCX export failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ATS-friendly PDF with a real text layer (Latin scripts).
  const handleDownloadAtsPdf = async () => {
    setMenuOpen(false);
    setIsDownloading(true);
    try {
      const blob =
        activeTab === "cv"
          ? buildCvPdfBlob(state.generatedCV, state.generatedTitle)
          : buildCoverLetterPdfBlob(state.generatedCoverLetter);
      saveAs(blob, `${baseName}.pdf`);
    } catch (err) {
      console.error("ATS PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    setMenuOpen(false);
    const source = activeTab === "cv" ? cvRef.current : coverRef.current;
    if (!source) return;
    setIsDownloading(true);
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      await html2pdf()
        .set({
          margin: [10, 15, 10, 15] as [number, number, number, number],
          filename: `${baseName}-styled.pdf`,
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-hidden overflow-y-auto max-h-[min(1200px,calc(100vh-10rem))] min-h-[600px]">
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
            <div className="relative flex-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {isAr ? "جارٍ التنزيل..." : "Preparing..."}</>
                ) : (
                  <><Download className="w-5 h-5" /> {isAr ? "تنزيل" : "Download"} <ChevronDown className="w-4 h-4" /></>
                )}
              </button>

              {menuOpen && !isDownloading && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                  <button
                    onClick={handleDownloadDocx}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors"
                  >
                    <FileType className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {isAr ? "تنزيل DOCX" : "Download DOCX"}
                        <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                          {isAr ? "الأفضل لـ ATS" : "BEST FOR ATS"}
                        </span>
                      </span>
                      <span className="block text-xs text-gray-500">
                        {isAr ? "نص حقيقي قابل للقراءة آلياً" : "Real selectable text, parses cleanly"}
                      </span>
                    </span>
                  </button>

                  {!isAr && (
                    <button
                      onClick={handleDownloadAtsPdf}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors border-t border-gray-100"
                    >
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">
                          PDF (ATS text)
                          <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                            ATS
                          </span>
                        </span>
                        <span className="block text-xs text-gray-500">Single column, real text layer</span>
                      </span>
                    </button>
                  )}

                  <button
                    onClick={handleDownload}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors border-t border-gray-100"
                  >
                    <ImageIcon className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {isAr ? "PDF بالتصميم" : "PDF (styled)"}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {isAr
                          ? "مطابق للمعاينة — للعرض البشري، ليس مثالياً لـ ATS"
                          : "Matches preview — for human eyes, not ideal for ATS"}
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: ATS score + chat */}
        <div className="space-y-4">
        {state.mode === "tailor" && activeTab === "cv" && state.generatedCV && (
          <AtsScorePanel
            cv={state.generatedCV}
            jobDescription={state.jobDescription}
            language={state.language}
          />
        )}
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

          <div className="flex gap-2 items-end">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
              placeholder="e.g., Add more skills..."
              rows={4}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm resize-y min-h-[100px] max-h-[240px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleChat}
              disabled={isChatting || !chatInput.trim()}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
