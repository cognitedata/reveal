export interface BreadCrumbStatInfo {
  name: string;
  content: {
    name: string;
    count: number;
  }[];
}

export interface BreadCrumbStats {
  totalResults?: number;
  currentHits: number;
  label?: string;
  info?: BreadCrumbStatInfo[];
}
