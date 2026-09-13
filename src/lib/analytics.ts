/**
 * Whether this build has analytics at all. A fork or a self-hoster that never
 * sets a key gets no provider, no script and no switch — rather than a provider
 * trusted to stay quiet on its own.
 */
export const analyticsConfigured = Boolean(
  import.meta.env.VITE_PUBLIC_POSTHOG_KEY
);

/**
 * Whether the browser is asking not to be tracked.
 *
 * PostHog checks this itself when `respect_dnt` is set, but the answer is
 * needed here too: the setting has to be shown as overridden rather than as a
 * switch that appears to do nothing, and the app decides what to send rather
 * than depending on how the SDK resolves an explicit opt-in against a Do Not
 * Track header.
 */
export const doNotTrackEnabled = (): boolean => {
  const nav = navigator as Navigator & { msDoNotTrack?: string | null };
  const win = window as Window & { doNotTrack?: string | null };
  return [nav.doNotTrack, nav.msDoNotTrack, win.doNotTrack].some(
    (flag) => flag === "1" || flag === "yes"
  );
};

/**
 * What the app asks PostHog to do: the user's choice, with Do Not Track able to
 * veto it but never to enable it.
 *
 * Deliberately says nothing about whether a key is configured. That guarantee
 * is structural -- AnalyticsProvider renders no provider without one, so there
 * is no client to capture through -- and folding it in here would make this
 * answer differently on a machine with a .env than on CI.
 */
export const shouldCapture = (
  analyticsEnabled: boolean,
  doNotTrack: boolean
): boolean => analyticsEnabled && !doNotTrack;
