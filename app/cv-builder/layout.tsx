import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Builder — Create Your Resume",
};

export default function CVBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}