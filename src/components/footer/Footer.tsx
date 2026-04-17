export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--border)] px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-[var(--border)] tracking-widest uppercase">
          &copy; {year} Lemaire Quentin — Full-stack Developer
        </p>
        <p className="font-mono text-xs text-[var(--border)] tracking-widest">
          Next.js 16 · Tailwind CSS 4 · Framer Motion
        </p>
      </div>
    </footer>
  );
}
