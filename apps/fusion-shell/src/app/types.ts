import { ReactElement } from 'react';

import { IconType } from '@cognite/cogs.js';
import { IDPType } from '@cognite/login-utils';

declare global {
  interface Window {
    testAuthOverrides?: {
      getToken: () => Promise<string>;
    };
  }
}

export type Action = 'LIST' | 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
export type Acl = {
  acl: string;
  action: Action;
};

export interface Tag {
  title: string;
  description: string;
  color?: string;
}

export type AppCategory =
  | 'integrate'
  | 'contextualize'
  | 'explore'
  | 'configure';

export interface AppItem {
  ariaLabel?: string;
  category?: AppCategory;
  externalLinkTo?: string;
  hideInCluster?: string[];
  icon: IconType;
  img?: string;
  importMapApp: string;
  internalId: string;
  linkTo: string;
  onClick?(): void;
  requiredFlow?: IDPType[];
  sameWindow?: boolean;
  subtitle: string;
  tag?: Tag;
  tooltip?: string | ReactElement;
  title: string;
  tagname?: string;
}

export type RawAppItem = Omit<AppItem, 'title' | 'subtitle'>;

export interface SectionColors {
  primary: string;
  secondary: string;
  background?: string;
  icon?: string;
}

export interface Section {
  internalId: AppCategory;
  linkTo?: string;
  externalLinkTo?: string;
  sameWindow?: boolean;
  colors: SectionColors;
  items: AppItem[];
  icon?: IconType;
}

export interface Token {
  subject: string;
  projects: Project[];
  capabilities: unknown;
}

export interface Project {
  projectUrlName: string;
  groups: BigInt64Array;
}

export interface AppConfig {
  // ex: data-catalog
  key: string;
  // ex: @cognite/cdf-data-catalog
  appName: string;
  appType: 'module-federation' | 'single-spa';
  // https://app-name.web.app
  url: string;
  routes: {
    route: string;
  }[];
}
export interface AppManifest {
  apps: AppConfig[];
}

export interface ModuleFederationImportMap {
  [key: string]: string;
}
