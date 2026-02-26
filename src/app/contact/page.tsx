import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get in touch with the BehindTheText team. Report bugs, request features, or ask questions about the text-behind-image tool.",
  alternates: { canonical: "https://behindthetext.site/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-extenda-light)] text-5xl sm:text-6xl tracking-tight">Contact & Support</h1>

      <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>
          <p className="mt-2">
            Have a question, found a bug, or want to request a feature? We would
            love to hear from you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Email</h2>
          <p className="mt-2">
            Reach us at{" "}
            <a
              href="mailto:behindthetext@atomicmail.io"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              behindthetext@atomicmail.io
            </a>
          </p>
          <p className="mt-1">We typically respond within 24-48 hours.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">GitHub</h2>
          <p className="mt-2">
            BehindTheText is open source. Report issues or contribute on GitHub:
          </p>
          <a
            href="https://github.com/saurabhwebdev/behindthetext"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            github.com/saurabhwebdev/behindthetext
          </a>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
          <div className="mt-3 space-y-4">
            <div>
              <h3 className="font-medium text-foreground">
                Are my images uploaded to your servers?
              </h3>
              <p className="mt-1">
                No. All processing happens entirely in your browser. Your images
                never leave your device.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Is BehindTheText free to use?
              </h3>
              <p className="mt-1">
                Yes, completely free. No signup, no watermarks required, no
                hidden fees.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                What browsers are supported?
              </h3>
              <p className="mt-1">
                BehindTheText works best in modern browsers like Chrome, Edge,
                and Firefox. WebGPU-enabled browsers (Chrome 113+) offer the
                fastest performance, with automatic fallback to WebAssembly for
                other browsers.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Why does the first image take longer to process?
              </h3>
              <p className="mt-1">
                The AI depth model (~45MB) is downloaded on first use and cached
                in your browser. Subsequent images process much faster.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 border-t pt-6">
        <Link
          href="/"
          className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Back to BehindTheText
        </Link>
      </div>
    </div>
  );
}
