import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for BehindTheText. Read our terms for using the free text-behind-image tool.",
  alternates: { canonical: "https://behindthetext.site/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-extenda-light)] text-5xl sm:text-6xl tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: February 26, 2026
      </p>

      <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing and using BehindTheText (&quot;the Service&quot;), you
            agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Description of Service
          </h2>
          <p className="mt-2">
            BehindTheText is a free online tool that allows you to place text
            behind subjects in images using AI-powered depth estimation. All
            processing occurs in your browser — no images are uploaded to our
            servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Use of the Service
          </h2>
          <p className="mt-2">You agree to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Use the Service only for lawful purposes</li>
            <li>
              Not use the Service to process images that violate any applicable
              laws or third-party rights
            </li>
            <li>
              Not attempt to reverse engineer, decompile, or disassemble the
              Service
            </li>
            <li>
              Not use automated tools to scrape or abuse the Service
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Intellectual Property
          </h2>
          <p className="mt-2">
            You retain all rights to the images you upload and the output you
            create using the Service. BehindTheText does not claim any ownership
            over your content.
          </p>
          <p className="mt-2">
            The Service itself, including its design, code, and branding, is the
            property of BehindTheText and is protected by applicable
            intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Disclaimer of Warranties
          </h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. We do not guarantee that the Service will be uninterrupted,
            error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p className="mt-2">
            To the fullest extent permitted by law, BehindTheText shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising out of or related to your use of the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Changes to Terms
          </h2>
          <p className="mt-2">
            We reserve the right to modify these Terms at any time. Changes will
            be posted on this page with an updated date. Continued use of the
            Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            If you have questions about these Terms, please contact us at{" "}
            <a
              href="mailto:behindthetext@atomicmail.io"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              behindthetext@atomicmail.io
            </a>
            .
          </p>
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
