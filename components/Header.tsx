import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center px-6 py-4 bg-surface-950 border-b border-surface-700">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="font-heading text-xl text-brand-500 tracking-wider">
          UNCONSTRAINED
        </span>
        <span className="text-surface-500 text-xs tracking-widest">
          SNIPPETS
        </span>
      </Link>
    </header>
  );
}
