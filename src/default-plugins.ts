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
    url: "https://gitlab.com/api/v4/projects/37878305/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "MLWVs6Y6j3EI6mT76Jo-S",
    name: "Plugin for Vimeo",
    description: "Plugins for playing videos from Vimeo.",
    url: "https://gitlab.com/api/v4/projects/38552874/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "CGC-9cCjRx7eWFB2bUXv6",
    name: "Plugin for Rumble",
    description: "Plugin for playing videos from rumble.com",
    url: "https://gitlab.com/api/v4/projects/38710555/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "WfjGSNBS6jkt1OyNecWoM",
    name: "Plugin for Peertube",
    description: "Plugin for playing videos from peertube",
    url: "https://gitlab.com/api/v4/projects/39985598/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "7bCIGEj1VK40kHZkBe416",
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://gitlab.com/api/v4/projects/39354817/repository/files/manifest.json/raw?ref=master",
  },
  {
    id: "G0y4w_PEjvc3cGEJA1Qfq",
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://gitlab.com/api/v4/projects/39316768/repository/files/manifest.json/raw?ref=master",
  },
];

export const defaultPluginMap = new Map(defaultPlugins.map((p) => [p.id, p]));
