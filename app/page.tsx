import Link from "next/link";
import { Sparkles, FileText, ArrowLeft } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">CV Builder AI</span>
        </div>
        <Link
          href="/cv-builder"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Get Started
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Create a Professional CV
          <br />
          <span className="text-indigo-600">In Just Minutes</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, add the job description, and choose the perfect design.
          Our AI will generate an ATS-optimized CV and a standout cover letter.
        </p>
        <Link
          href="/cv-builder"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-700 transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
          Start for Free
        </Link>
      </section>

      {/* Steps */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">Four simple steps to your perfect CV</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: "📄", title: "Upload CV", desc: "Upload your existing resume (PDF or DOCX) or start from scratch" },
              { step: "2", icon: "🎨", title: "Choose Template", desc: "Select from 9 professional ATS-friendly designs" },
              { step: "3", icon: "✨", title: "AI Generation", desc: "Claude optimizes content and writes cover letter automatically" },
              { step: "4", icon: "⬇️", title: "Download", desc: "Save your CV and cover letter as PDF or DOCX" },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎯", title: "ATS Optimized", desc: "All templates are designed to pass Applicant Tracking Systems" },
            { icon: "🌍", title: "Multilingual", desc: "Generate CVs in Arabic or English based on job requirements" },
            { icon: "💬", title: "Smart Chat", desc: "Talk to AI to modify any part of your CV instantly" },
            { icon: "📝", title: "Cover Letter", desc: "Generate tailored cover letters for each job automatically" },
            { icon: "🎨", title: "9 Templates", desc: "From classic to modern, there&apos;s a design for every professional" },
            { icon: "⚡", title: "Lightning Fast", desc: "Get a complete CV in seconds, not hours" },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <div className="text-2xl">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
        <p className="text-indigo-200 mb-8">Create a professional CV now for free</p>
        <Link
          href="/cv-builder"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-indigo-50 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>CV Builder AI — Powered by Claude from Anthropic</p>
      </footer>
    </main>
  );
}