export interface BreadCrumbContent {
  name: string;
  content: {
    name: string;
    count: number;
  }[];
}

export interface BreadCrumbStats {
  totalResults?: number;
  currentHits: number;
}
