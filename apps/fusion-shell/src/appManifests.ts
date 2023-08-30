import manifests from './appManifestData.json';

export type Environment = 'staging' | 'preview' | 'production';

export type Hosting = Record<Environment, string>;

export type AppManifest = {
  key: string;
  appName: string;
  hosting: Hosting;
  routes: { route: string }[];
};

export const appManifests: AppManifest[] = manifests;
