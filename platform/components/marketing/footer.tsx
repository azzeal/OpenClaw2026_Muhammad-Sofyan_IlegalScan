export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-subtle">
      <div className="container-app py-10">
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} ClearMark — brand protection untuk e-commerce Indonesia.</div>
          <div className="flex gap-4">
            <a href="https://www.pom.go.id" target="_blank" rel="noreferrer" className="hover:text-foreground">
              BPOM
            </a>
            <span>·</span>
            <span>Made in Bandung 🦑</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
