"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setConsent, trackVisit } from "@/lib/supabase-metadata";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )btt_consent=([^;]*)/);
    if (!match) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent(true);
    trackVisit(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    trackVisit(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies for anonymous usage analytics to improve the tool. No
          personal data is collected.{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
