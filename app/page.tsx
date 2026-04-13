import { getAllSnippets } from "@/lib/snippets";
import SnippetCard from "@/components/SnippetCard";
import Header from "@/components/Header";

export default function Home() {
  const snippets = getAllSnippets();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl text-white tracking-wide mb-2">
          ALL SNIPPETS
        </h1>
        <p className="text-surface-400 mb-8">
          Code snippets for UnconstrainED courses.
        </p>
        <div className="grid gap-4">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
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
