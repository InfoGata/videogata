# Reporting abuse

VideoGata is a player. It stores no videos, thumbnails or comments, and it runs
no server that content passes through. When you watch something, the plugin for
that platform fetches it from that platform directly, from your own device,
using your own connection. Nothing is copied to us on the way.

A few details, so that claim is exact rather than approximate:

- The app's service worker can retry a stream's requests through the InfoGata
  browser extension. That happens inside your own browser, not on a server.
- You can set a CORS proxy in Settings. It's one you choose and run; the app
  ships without one.
- The Dropbox and Google Drive plugins read and write your own files, in your
  own account.

That shapes what a report to us can and can't achieve, so it's worth being
direct about it before you write one.

## What we can act on

- **The plugin catalog.** The list of plugins offered inside the app is curated
  by us (`src/default-plugins.ts`), and we can remove an entry from it. See
  [Delisting a plugin](#delisting-a-plugin).
- **Plugins we publish.** The plugins under the
  [InfoGata](https://github.com/InfoGata) organization are ours, and we can
  change or withdraw them. Installed plugins update automatically unless the
  user has turned that off, so a change we publish does reach existing
  installations.
- **The app and this site.** Anything we actually host.

## What we can't act on

- **Content on YouTube, Vimeo, Rumble, PeerTube, Twitch or anywhere else.** We
  have no copy of it and no ability to remove, edit or hide it. A notice sent to
  us does not reach the platform hosting the material, and we don't forward
  notices on a reporter's behalf — send it to that platform's own abuse or
  copyright contact, which every one of them publishes.
- **Accounts, bans or moderation on those platforms.** We have no relationship
  with any of them.
- **Files in someone's own Dropbox or Google Drive.** Those belong to that
  account and are governed by that provider.

If a report reaches us that we can't act on, we'll say so once, point you at the
right place, and close it. That isn't a brush-off; it's the honest limit of what
a client-side player can do.

## How to report

Email **contact@videogata.com**. Include enough that we can find the thing
you're describing without guessing.

### Copyright

If you're sending a notice under the DMCA, US law asks that it contain all six
of these. A notice missing them may not be actionable, and we'd rather tell you
that up front than after a delay:

1. A physical or electronic signature of the copyright owner, or someone
   authorized to act for them
2. Identification of the copyrighted work claimed to be infringed
3. Identification of the material claimed to be infringing, specific enough that
   we can locate it
4. Your contact details — address, telephone number, email
5. A statement that you have a good-faith belief the use isn't authorized by the
   owner, its agent, or the law
6. A statement, under penalty of perjury, that the information is accurate and
   that you're authorized to act for the owner

Note that for material hosted on another platform, points 3 and 6 are exactly
where a notice to us breaks down: we can't disable access to something we never
had. What we *can* consider is whether a plugin in our catalog exists primarily
to surface that material.

### Everything else

Malicious plugin behavior, security problems, illegal material being surfaced
through a plugin we list, or a site operator asking us to stop pointing at them
— same address, and please say which it is in the subject line.

For a security vulnerability in the app itself, prefer a private report so it
can be fixed before it's public.

## Delisting a plugin

The catalog is the main lever we have, so this is the policy that governs it.

### Grounds

We will remove a plugin from the catalog when:

- it exists primarily to surface infringing material, and the source it reads
  won't act on notices
- it behaves maliciously — exfiltrating data, requesting credentials it has no
  use for, or doing anything outside what its description claims
- the operator of the site it reads asks us to stop listing it
- we're required to by a court or by a provider we depend on

We will **not** delist a plugin merely because the platform it reads hosts
objectionable material somewhere on it. That's true of every platform, including
every one we already list.

### Process

1. You report it, with enough detail to verify.
2. We verify it ourselves. We don't delist on assertion alone.
3. If it's warranted, the entry is removed and the app is redeployed.
4. The change is a commit in this repository, so the record of what was removed
   and when is public and permanent.

We aim to acknowledge a report within seven days and to act on a verified one
promptly after that.

### What delisting does and doesn't do

Delisting removes a plugin from the list of plugins the app *offers*, and a
plugin the app installs on first run stops being installed for new users. It
does not uninstall it. Plugins live in the browser's own storage on each device,
and we have no mechanism — and want no mechanism — to reach into an installation
and remove software someone chose to install. Anyone who already has it keeps it
until they remove it themselves.

Anyone can also still install any plugin by URL. The catalog is a curated
starting point, not a permission list, and delisting is not a block.

### Disagreeing with a delisting

Open an issue on this repository or email the address above. We'll explain the
reasoning, and we'll relist if we got it wrong.
