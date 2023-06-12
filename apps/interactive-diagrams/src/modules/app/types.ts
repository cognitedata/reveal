export interface AppState {
  project?: string;
  cdfEnv?: string;
  loaded: boolean;
  groups: { [key: string]: string[] };
}
