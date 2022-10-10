export interface PluginDescription {
  name: string;
  url: string;
  description: string;
}

export const defaultPlugins: PluginDescription[] = [
  {
    name: "Plugin for Youtube",
    description: "Plugin for playing videos from youtube.com",
    url: "https://gitlab.com/api/v4/projects/37878305/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Vimeo",
    description: "Plugins for playing videos from Vimeo.",
    url: "https://gitlab.com/api/v4/projects/38552874/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Rumble",
    description: "Plugin for playing videos from rumble.com",
    url: "https://gitlab.com/api/v4/projects/38710555/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Google Drive",
    description: "Store and retrieve playlists from Google Drive",
    url: "https://gitlab.com/api/v4/projects/39354817/repository/files/manifest.json/raw?ref=master",
  },
  {
    name: "Plugin for Dropbox",
    description: "Store and retreive playlists from Dropbox",
    url: "https://gitlab.com/api/v4/projects/39316768/repository/files/manifest.json/raw?ref=master",
  },
];
