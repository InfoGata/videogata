/* eslint-disable i18next/no-literal-string */
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { abuseEmail, abusePolicyUrl } from "@/lib/contact";

const MailLink: React.FC<{ subject: string; children: React.ReactNode }> = ({
  subject,
  children,
}) => (
  <a
    href={`mailto:${abuseEmail}?subject=${encodeURIComponent(subject)}`}
    className="text-primary hover:underline"
  >
    {children}
  </a>
);

const Abuse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>🚩</span>
          Reporting Abuse
        </h1>
        <p className="text-muted-foreground">
          How to reach us about a plugin, and what a report to us can and can’t
          achieve.
        </p>
      </div>

      {/* The thing everything else follows from */}
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-lg font-semibold">VideoGata stores nothing</h2>
        <p className="text-sm text-muted-foreground">
          VideoGata is a player. When you watch something, the plugin for that
          platform fetches it from that platform directly, from your device,
          over your connection. No videos, thumbnails or comments are copied to
          us, and no server of ours sits in between. A CORS proxy, if you set
          one, is your own. That limit is what shapes everything below.
        </p>
      </div>

      {/* What we can and can't do, side by side on purpose */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span>✅</span>What we can act on
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>
              <strong className="text-foreground">The plugin catalog.</strong>{" "}
              The plugins the app offers are curated by us, and we can remove an
              entry.
            </li>
            <li>
              <strong className="text-foreground">Plugins we publish.</strong>{" "}
              The plugins under the InfoGata organization are ours to change or
              withdraw, and installed plugins update automatically unless
              that’s been turned off.
            </li>
            <li>
              <strong className="text-foreground">The app and this site.</strong>{" "}
              Anything we actually host.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span>🚫</span>What we can’t
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
            <li>
              <strong className="text-foreground">
                Content on another platform.
              </strong>{" "}
              We have no copy of it and no way to remove, edit or hide it. A
              notice sent to us doesn’t reach the platform hosting it, and we
              don’t forward notices on a reporter’s behalf.
            </li>
            <li>
              <strong className="text-foreground">
                Accounts, bans or moderation.
              </strong>{" "}
              We have no relationship with any platform the app can read.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Every platform publishes its own abuse and copyright contact. For
            material hosted there, that is the only route that can actually
            result in its removal.
          </p>
        </div>
      </section>

      {/* How to report */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✉️</span>
          <h2 className="text-2xl font-semibold">How to report</h2>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">Copyright</h3>
          <p className="text-sm text-muted-foreground">
            A notice under the DMCA needs six things: your signature, the work
            you say is infringed, the material you say infringes it and where to
            find it, your contact details, a good-faith statement that the use
            isn’t authorized, and a statement under penalty of perjury that the
            notice is accurate and that you’re authorized to send it.
          </p>
          <p className="text-sm text-muted-foreground">
            For material hosted elsewhere, we can’t disable access to something
            we never had. What we can consider is whether a plugin we list
            exists primarily to surface it.
          </p>
          <MailLink subject="Copyright notice">
            Send a copyright notice →
          </MailLink>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">A plugin</h3>
          <p className="text-sm text-muted-foreground">
            A plugin behaving maliciously, surfacing illegal material, or
            reading a site whose operator has asked us to stop. Tell us which
            plugin and what it did.
          </p>
          <MailLink subject="Plugin report">Report a plugin →</MailLink>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-lg">A security problem</h3>
          <p className="text-sm text-muted-foreground">
            Please report privately, so it can be fixed before it’s public.
          </p>
          <MailLink subject="Security report">
            Report a vulnerability →
          </MailLink>
        </div>
      </section>

      {/* Delisting */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h2 className="text-2xl font-semibold">Delisting a plugin</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          The catalog is the main lever we have. We remove a plugin from it when
          it exists primarily to surface infringing material and its source
          won’t act, when it behaves maliciously, when the site it reads asks us
          to stop, or when we’re required to. We don’t delist a plugin because
          the platform it reads hosts objectionable material somewhere — that is
          true of every platform we list.
        </p>
        <p className="text-sm text-muted-foreground">
          We verify reports ourselves rather than delisting on assertion, and
          every removal is a public commit in the repository, so the record of
          what went and when is permanent.
        </p>

        <div className="rounded-lg border bg-muted/50 p-5 space-y-2">
          <h3 className="font-semibold">What delisting doesn’t do</h3>
          <p className="text-sm text-muted-foreground">
            It removes a plugin from the list the app offers, and from the
            plugins new users get installed on first run. It does not uninstall
            it. Plugins live in your browser’s storage on your own
            device, and we have no mechanism — and want none — to reach into an
            installation and remove software someone chose to install. Anyone
            can also still install any plugin by URL. The catalog is a starting
            point, not a permission list.
          </p>
        </div>

        <a
          href={abusePolicyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Read the full policy →
        </a>
      </section>

      {/* Footer note */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>
          We aim to acknowledge a report within seven days. If a report reaches
          us that we can’t act on, we’ll say so once and point you at the right
          place — that’s the honest limit of what a player can do, not a
          brush-off.
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/abuse")({
  component: Abuse,
});
