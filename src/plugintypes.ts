export interface SearchAllResult {
  videos?: SearchVideoResult;
}

export interface SearchRequest {
  query: string;
  page?: PageInfo;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
  offset: number;
  nextPage?: string;
  prevPage?: string;
}

export interface Video {
  id?: string;
  title: string;
  apiId?: string;
  duration: number;
  pluginId?: string;
  sources?: VideoSource[];
}

export interface VideoSource {
  source: string;
  type: string;
}

export interface PluginInfo {
  id?: string;
  name: string;
  script: string;
  version?: string;
  description?: string;
  optionsHtml?: string;
  playerHtml?: string;
  optionsSameOrigin?: boolean;
  manifestUrl?: string;
}

export interface SearchVideoResult {
  items: Video[];
  pageInfo?: PageInfo;
}
