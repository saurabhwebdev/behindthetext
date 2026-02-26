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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 26, 2026
      </p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
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
            Data We Collect
          </h2>
          <p className="mt-2">
            When you export an image, we collect anonymous usage metadata to
            improve the service. This includes:
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
          </ul>
          <p className="mt-2">
            We do not collect your name, email address, IP address, or any
            personally identifiable information. We do not use cookies for
            tracking.
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
            Anonymous usage metadata is retained indefinitely to help us
            understand how the tool is used and to improve it. Since no personal
            data is collected, there is no personal data to delete.
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
