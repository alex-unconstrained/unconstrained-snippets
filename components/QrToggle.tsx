"use client";

import { useState } from "react";

export default function QrToggle({ svg, url }: { svg: string; url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-md text-xs uppercase tracking-widest border border-surface-700 text-surface-400 hover:border-brand-500/50 hover:text-white transition-colors cursor-pointer"
      >
        {open ? "Hide QR" : "QR"}
      </button>
      {open && (
        <div className="mt-3 inline-flex flex-col items-center gap-2 p-4 bg-white rounded-lg">
          <div className="w-48 h-48" dangerouslySetInnerHTML={{ __html: svg }} />
          <span className="text-surface-800 text-xs font-mono break-all">{url}</span>
        </div>
      )}
    </div>
  );
}
