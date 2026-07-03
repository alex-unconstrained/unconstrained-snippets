import { notFound } from "next/navigation";
import { getAllCourses, getAllSnippets, getCourseBySlug, sortSnippets } from "@/lib/snippets";
import SnippetCard from "@/components/SnippetCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QrToggle from "@/components/QrToggle";
import { qrCodeSvg, SITE_URL } from "@/lib/qr";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCourses().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: `${course.title} — UnconstrainED Snippets`,
    description: course.description ?? `Course materials: ${course.title}`,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const snippets = sortSnippets(getAllSnippets().filter((s) => s.course === slug));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <p className="text-surface-500 text-xs uppercase tracking-widest mb-2">Course</p>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-heading text-3xl text-white tracking-wide">
            {course.title.toUpperCase()}
          </h1>
          <QrToggle
            svg={await qrCodeSvg(`/courses/${slug}`)}
            url={`${SITE_URL}/courses/${slug}`}
          />
        </div>
        {course.description && (
          <p className="text-surface-400 mb-8 leading-relaxed">{course.description}</p>
        )}
        <div className="grid gap-4">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
