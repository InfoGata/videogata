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
