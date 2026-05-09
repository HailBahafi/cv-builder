import { PROJECT_EXTERNAL_LINKS } from "@/lib/constants";

interface ProjectLinksRowProps {
  variant?: "light" | "dark";
}

export default function ProjectLinksRow({ variant = "light" }: ProjectLinksRowProps) {
  const linkClass =
    variant === "dark"
      ? "text-indigo-100 hover:text-white underline-offset-2 hover:underline"
      : "text-indigo-600 hover:text-indigo-800 underline-offset-2 hover:underline";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
      aria-label="Related projects"
    >
      {PROJECT_EXTERNAL_LINKS.map((item) => (
        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
