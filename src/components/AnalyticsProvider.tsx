import React from "react";
import { PostHogProvider } from "posthog-js/react";
import { analyticsConfigured } from "@/lib/analytics";

/**
 * Wraps the app in PostHog only when a key is configured.
 *
 * A build without one renders no provider at all, so a self-hoster gets no
 * analytics script rather than a provider asked politely not to do anything.
 */
const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!analyticsConfigured) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: "2025-05-24",
        capture_exceptions: true,
        cookieless_mode: "always",
        // Belt and braces. The app already refuses to capture under Do Not
        // Track (see AnalyticsPreference), but nothing should depend on that
        // one component having mounted.
        respect_dnt: true,
      }}
    >
      {children}
    </PostHogProvider>
  );
};

export default AnalyticsProvider;
