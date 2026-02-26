import { Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40">
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> by{" "}
          <a
            href="https://github.com/saurabhwebdev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Saurabh Thakur
          </a>
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <a
            href="mailto:behindthetext@atomicmail.io"
            className="hover:text-foreground transition-colors"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
