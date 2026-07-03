import Link from "next/link";
import { getAllCourses, getAllSnippets, groupSnippets } from "@/lib/snippets";
import SnippetCard from "@/components/SnippetCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const { groups, general } = groupSnippets(getAllSnippets(), getAllCourses());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-heading text-3xl text-white tracking-wide mb-2">
          ALL SNIPPETS
        </h1>
        <p className="text-surface-400 mb-8">
          Prompts and code snippets for UnconstrainED courses.
        </p>
        {groups.map(({ course, snippets }) => (
          <section key={course.slug} className="mb-10">
            <Link
              href={`/courses/${course.slug}`}
              className="group flex items-baseline gap-2 mb-4"
            >
              <h2 className="font-heading text-xl text-brand-500 tracking-wide group-hover:text-brand-400 transition-colors">
                {course.title.toUpperCase()}
              </h2>
              <span className="text-surface-500 text-xs group-hover:text-surface-400 transition-colors">
                view course →
              </span>
            </Link>
            <div className="grid gap-4">
              {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          </section>
        ))}
        {general.length > 0 && (
          <section>
            {groups.length > 0 && (
              <h2 className="font-heading text-xl text-surface-400 tracking-wide mb-4">
                GENERAL
              </h2>
            )}
            <div className="grid gap-4">
              {general.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
