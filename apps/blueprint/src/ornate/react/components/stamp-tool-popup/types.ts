export interface Stamp {
  name: string;
  url: string;
}

export interface StampGroup {
  name: string;
  stamps: Stamp[];
  projects?: string[];
}
