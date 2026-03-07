interface ProseProps {
  children: React.ReactNode;
}

export function Prose({ children }: ProseProps) {
  return (
    <div className="prose prose-slate prose-base max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-org-blue prose-a:no-underline hover:prose-a:underline prose-table:bg-white prose-table:rounded-xl prose-table:border prose-table:border-slate-200 prose-table:overflow-hidden prose-th:bg-slate-50 prose-th:text-[11px] prose-th:font-semibold prose-th:uppercase prose-th:tracking-wide prose-th:text-slate-500 prose-th:px-4 prose-th:py-2.5 prose-td:px-4 prose-td:py-2 prose-td:text-sm prose-td:border-t prose-td:border-slate-100">
      {children}
    </div>
  );
}
