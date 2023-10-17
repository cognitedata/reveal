import manifests from './appManifestData.json';

export type Environment = 'staging' | 'preview' | 'production';

export type Hosting = Record<Environment, string>;

export type AppManifest = {
  key: string;
  appName: string;
  hosting: Hosting | boolean; // More like Hosting | false but TS will always detect it as boolean
  routes: { route: string }[];
};

export const appManifests: AppManifest[] = manifests;
