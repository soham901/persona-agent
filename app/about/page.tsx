// app/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About – Persona Agent",
  description: "About the project and author",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>
      <p className="text-muted-foreground">
        Hi, I’m <span className="font-medium">Soham</span>. This project is a
        playground for building conversational AI personas with a clean, modern
        UI and pragmatic patterns.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Find me online</h2>
        <ul className="list-disc pl-6">
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="https://github.com/soham901"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/soham901
            </Link>
          </li>
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="https://x.com/soham901x"
              target="_blank"
              rel="noopener noreferrer"
            >
              x.com/soham901x
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What’s inside</h2>
        <p className="text-muted-foreground">
          Built with Next.js App Router, TypeScript, and a component system for
          chat UIs (streaming responses, sources, tools, and more).
        </p>
      </section>

      <div className="pt-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
