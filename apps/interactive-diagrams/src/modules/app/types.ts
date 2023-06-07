export interface AppState {
  project?: string;
  cdfEnv?: string;
  loaded: boolean;
  groups: { [key: string]: string[] };
}

export type OnResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  showSidebar?: boolean;
};
