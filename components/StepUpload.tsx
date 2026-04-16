"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, ArrowLeft, Loader2, Type } from "lucide-react";
import type { StepProps, Language } from "@/types";
import { ALLOWED_FILE_TYPES, MIN_CV_LENGTH } from "@/lib/constants";

export default function StepUpload({ state, updateState, onNext }: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setIsLoading(true);
      setError("");
      setFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-file", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        updateState({ cvText: data.text });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to read file";
        setError(msg);
        setFileName("");
      } finally {
        setIsLoading(false);
      }
    },
    [updateState]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxFiles: 1,
  });

  const canProceed = state.cvText.trim().length > MIN_CV_LENGTH;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
        <p className="text-gray-500">Upload your file or paste text directly</p>
      </div>

      {/* Language selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">CV Language</label>
        <div className="flex gap-3">
          {(["ar", "en"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => updateState({ language: lang })}
              className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all
                ${state.language === lang
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
            >
              {lang === "ar" ? "🇸🇦 Arabic" : "🇬🇧 English"}
            </button>
          ))}
        </div>
      </div>

      {/* Input mode tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMode("upload")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
            ${inputMode === "upload" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Upload className="w-4 h-4 inline ml-2" />
          Upload File
        </button>
        <button
          onClick={() => setInputMode("paste")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
            ${inputMode === "paste" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <Type className="w-4 h-4 inline ml-2" />
          Paste Text
        </button>
      </div>

      {inputMode === "upload" ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${isDragActive ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}
            ${isLoading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input {...getInputProps()} />
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-gray-600">Reading file...</p>
            </div>
          ) : fileName && state.cvText ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-green-600 mt-1">Read {state.cvText.length} characters</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); updateState({ cvText: "" }); setFileName(""); }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" /> Remove File
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {isDragActive ? "Drop file here..." : "Drag and drop your file here"}
                </p>
                <p className="text-sm text-gray-400 mt-1">Or click to browse</p>
                <p className="text-xs text-gray-300 mt-2">PDF, DOCX, TXT</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={state.cvText}
          onChange={(e) => updateState({ cvText: e.target.value })}
          placeholder="Paste your resume text here or write from scratch..."
          className="w-full h-64 p-4 border border-gray-200 rounded-2xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-300 leading-relaxed"
          dir="auto"
        />
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Proceed without CV option */}
      <p className="text-center text-xs text-gray-400 mt-3">
        Don&apos;t have a CV?{` `}
        <button
          onClick={() => { updateState({ cvText: "Start from scratch" }); }}
          className="text-indigo-500 hover:underline"
        >
          Start from scratch
        </button>
      </p>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Next — Choose Template
        <ArrowLeft className="w-5 h-5" />
      </button>
    </div>
  );
}