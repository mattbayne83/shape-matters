interface ProseProps {
  children: React.ReactNode;
}

export function Prose({ children }: ProseProps) {
  return (
    <div className="prose prose-stone prose-base max-w-none prose-headings:font-bold prose-headings:font-serif prose-headings:tracking-tight prose-a:text-org-blue prose-a:no-underline prose-table:bg-white prose-table:rounded-xl prose-table:border prose-table:border-stone-200 prose-table:overflow-hidden prose-th:bg-stone-50 prose-th:text-[11px] prose-th:font-semibold prose-th:uppercase prose-th:tracking-wide prose-th:text-stone-500 prose-th:px-4 prose-th:py-2.5 prose-td:px-4 prose-td:py-2 prose-td:text-sm prose-td:border-t prose-td:border-stone-100">
      {children}
    </div>
  );
}
