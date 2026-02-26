import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for BehindTheText. Learn how we handle your data — all image processing happens in your browser. No images are uploaded to our servers.",
  alternates: { canonical: "https://behindthetext.site/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-extenda-light)] text-5xl sm:text-6xl tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: February 26, 2026
      </p>

      <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p className="mt-2">
            BehindTheText (&quot;we&quot;, &quot;our&quot;, or &quot;the
            Service&quot;) is a free online tool that lets you place text behind
            any image using AI-powered depth estimation. We are committed to
            protecting your privacy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Your Images Stay on Your Device
          </h2>
          <p className="mt-2">
            All image processing happens entirely in your browser. Your images
            are never uploaded to our servers. The AI depth estimation model runs
            locally using WebGPU or WebAssembly. We have no access to any images
            you use with this tool.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Cookies We Use
          </h2>
          <p className="mt-2">
            We use the following cookies, only after you provide consent via
            the cookie banner:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>btt_consent</strong> — stores your cookie consent choice
              (&quot;yes&quot; or &quot;no&quot;). Expires after 1 year.
            </li>
            <li>
              <strong>btt_session</strong> — a random session identifier used
              to group your usage activity. Not tied to your identity. Expires
              after 1 year.
            </li>
          </ul>
          <p className="mt-2">
            No tracking cookies from third parties are used. You can decline
            cookies via the consent banner, and no analytics data will be
            collected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data We Collect
          </h2>
          <p className="mt-2">
            If you accept cookies, when you export an image we collect anonymous
            usage metadata to improve the service. This includes:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Image dimensions (width and height)</li>
            <li>Image format (JPEG, PNG, WebP)</li>
            <li>Text content and font settings used</li>
            <li>Export resolution and DPI scale</li>
            <li>
              A random session identifier (generated locally, not tied to your
              identity)
            </li>
            <li>IP address (for geographic analytics only)</li>
            <li>Browser user agent string</li>
            <li>Country (derived from IP via hosting provider)</li>
          </ul>
          <p className="mt-2">
            We do not collect your name, email address, or any account-based
            personally identifiable information. If you decline cookies, none of
            the above data is collected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p className="mt-2">
            The AI model files are downloaded from Hugging Face when you first
            use the tool. After the initial download, the model is cached in
            your browser. Please refer to{" "}
            <a
              href="https://huggingface.co/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Hugging Face&apos;s Privacy Policy
            </a>{" "}
            for their data practices.
          </p>
          <p className="mt-2">
            We use Supabase to store anonymous usage metadata. No personal data
            is sent to Supabase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Data Retention
          </h2>
          <p className="mt-2">
            Usage metadata is retained indefinitely to help us understand how
            the tool is used and to improve it. IP addresses are stored for
            geographic analytics and may be periodically anonymized or deleted.
            If you wish to request deletion of your data, contact us at the
            email below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, please contact us
            at{" "}
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
