import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-6 py-16 gap-6">
      <p className="text-fd-muted-foreground uppercase tracking-widest text-xs">
        Native macOS client for Mihomo
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
        Kumo — a calm proxy app for Mac.
      </h1>
      <p className="text-fd-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
        Daily controls stay one click away. Connections, logs, rules, and
        Sub-Store are right there when you need them. The same KumoCoreKit
        powers the SwiftUI app and the <code>kumo</code> CLI, so humans and
        agents see exactly the same state.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/docs"
          className="rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Read the docs
        </Link>
        <Link
          href="/docs/getting-started/install"
          className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium hover:bg-fd-accent"
        >
          Install Kumo
        </Link>
        <Link
          href="https://github.com/ProjectKumo/KumoApp"
          className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium hover:bg-fd-accent"
        >
          View on GitHub
        </Link>
      </div>
    </div>
  );
}
