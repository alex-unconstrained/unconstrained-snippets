import { notFound } from "next/navigation";
import { getAllSnippets, getSnippetById } from "@/lib/snippets";
import { highlightCode } from "@/lib/highlight";
import CodeBlock from "@/components/CodeBlock";
import PromptBlock from "@/components/PromptBlock";
import Header from "@/components/Header";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const snippets = getAllSnippets();
  return snippets.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const snippet = getSnippetById(id);
  if (!snippet) return {};
  return {
    title: `${snippet.title} — UnconstrainED Snippets`,
    description: snippet.description ?? `Code snippet: ${snippet.title}`,
  };
}

export default async function SnippetPage({ params }: PageProps) {
  const { id } = await params;
  const snippet = getSnippetById(id);
  if (!snippet) notFound();

  const isPrompt = snippet.language === "prompt";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl text-white tracking-wide mb-2">
          {snippet.title.toUpperCase()}
        </h1>
        {snippet.description && (
          <p className="text-surface-400 mb-8 leading-relaxed">
            {snippet.description}
          </p>
        )}
        {isPrompt ? (
          <PromptBlock code={snippet.code} />
        ) : (
          <CodeBlock
            html={await highlightCode(snippet.code, snippet.language)}
            rawCode={snippet.code}
            language={snippet.language}
          />
        )}
      </main>
      <footer className="py-6 text-center border-t border-surface-700">
        <a
          href="https://unconstrained.dev"
          className="text-surface-600 text-xs tracking-wide hover:text-surface-400 transition-colors"
        >
          unconstrained.dev
        </a>
      </footer>
    </div>
  );
}
