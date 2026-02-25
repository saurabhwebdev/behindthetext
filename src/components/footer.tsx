import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full ">
      <div className="flex h-12 w-full items-center justify-between px-6">
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
        <a
          href="mailto:behindthetext@atomicmail.io"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Support
        </a>
      </div>
    </footer>
  );
}
