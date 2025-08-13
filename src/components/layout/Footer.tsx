export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-6">
      <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          WA Emergency Dashboard · Mock demo for design and development
        </div>
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()}</span>
          <a className="hover:underline" href="#">Privacy</a>
          <a className="hover:underline" href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
} 