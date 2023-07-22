export interface PluginDescription {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const defaultPlugins: PluginDescription[] = [
  {
    id: "IIEPnSr5isZy82cdy4ig9",
    name: "Plugin for Youtube",
    description: "Plugin for playing videos from youtube.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/youtube-videogata@latest/manifest.json",
  },
  {
    id: "MLWVs6Y6j3EI6mT76Jo-S",
    name: "Plugin for Vimeo",
    description: "Plugins for playing videos from Vimeo.",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/vimeo-videogata@latest/manifest.json",
  },
  {
    id: "CGC-9cCjRx7eWFB2bUXv6",
    name: "Plugin for Rumble",
    description: "Plugin for playing videos from rumble.com",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/rumble-videogata@latest/manifest.json",
  },
  {
    id: "WfjGSNBS6jkt1OyNecWoM",
    name: "Plugin for Peertube",
    description: "Plugin for playing videos from peertube",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/peertube-videogata@latest/manifest.json",
  },
  {
    id: "b87fe67b-1b62-4c44-a5a4-e7cc6cd30c84",
    name: "Plugin for Twitch",
    description: "Plugin for playing videos from twitch.tv",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/twitch-videogata@latest/manifest.json",
  },
  {
    id: "7bCIGEj1VK40kHZkBe416",
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/googledrive-videogata@latest/manifest.json",
  },
  {
    id: "G0y4w_PEjvc3cGEJA1Qfq",
    name: "Plugin for Dropbox",
    description: "Store and retrieve playlists from Dropbox",
    url: "https://cdn.jsdelivr.net/gh/InfoGata/dropbox-videogata@latest/manifest.json",
  },
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));
