# VideoGata

A plugin based web app that plays videos.

https://www.videogata.com

## Running locally

```console
npm install
npm run dev
```

## Versioning

`package.json` holds the version and `npm version <major|minor|patch>` is the
only thing that changes it. The web and desktop builds stamp it in alongside the
commit, the Android build derives `versionCode` from it, and the About page
shows it; tapping it copies the build, platform and user agent for bug reports.

## Over-the-air updates

The Android and iOS apps can update their web code without a store release:

```sh
npm version patch      # each update needs a new version
git push --follow-tags
npm run ota:publish    # builds, then attaches the bundle to GitHub release v<version>
```

The app checks the latest release's `ota.json` on launch, downloads the
bundle, and switches to it the next time it goes to the background. A bundle
that fails to start is rolled back automatically. `-- --dry-run` builds and
zips into `ota-out/` without uploading.

Bundles are signed, and the app installs nothing else. `npm run ota:keygen`
created the key pair once: the public key is `ota-public-key.pem` in the repo,
and the private key is at `~/.android/videogata-release/ota-private.pem`
(override with `OTA_PRIVATE_KEY_PATH`). Back it up. Without it, no more OTA
updates can be published until a store build ships with a new public key.

A bundle is only offered to binaries built from the same native code
(`native-fingerprint.ts`). After a change to anything under `android/` or
`ios/`, `capacitor.config.ts`, or a Capacitor or Cordova plugin version, ship a
store build as well. Until users install it they stay on their current version,
and nothing breaks.

## Plugins

The plugin scripts are run in sandboxed iframes using [plugin-frame](https://github.com/elijahgreen/plugin-frame). Every iframe is ran on it's own subdomain with it's subdomain being the id of the plugin ([pluginId].videogata.com).

[youtube-videogata](https://github.com/InfoGata/youtube-videogata)

[peertube-videogata](https://github.com/InfoGata/peertube-videogata)

[vimeo-videogata](https://github.com/InfoGata/vimeo-videogata)

[rumble-videogata](https://github.com/InfoGata/rumble-videogata)

[dropbox-videogata](https://github.com/InfoGata/dropbox-videogata)

[googledrive-videogata](https://github.com/InfoGata/googledrive-videogata)

## Plugin Development

[Docs](https://infogata.github.io/videogata-plugin-typings/plugins/plugin-manifest)

[Types](https://github.com/InfoGata/videogata-plugin-typings)
