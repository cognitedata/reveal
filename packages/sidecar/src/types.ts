import { IntercomBootSettings } from '@cognite/intercom-helper';

import { Service } from './getDefaultSidecar';

export type CDFCluster =
  | 'asia-northeast1-1'
  | 'az-ams-aloe'
  | 'az-eastus-1'
  | 'az-power-no-northeurope'
  | 'azure-dev'
  | 'bluefield'
  | 'bp-northeurope'
  | 'ew1'
  | 'greenfield'
  | 'omv'
  | 'pgs'
  | 'power-no'
  | 'statnett'
  | 'westeurope-1';

export type FakeIdp = {
  cluster: string;
  customExpiry?: number;
  fakeApplicationId: string;
  groups: string[];
  name?: string;
  otherAccessTokenFields: Record<string, string>;
  otherIdTokenFields: Record<string, string>;
  project: string;
  userId?: string;
  tokenId?: string;
  roles: string[];
};

export type ApiBaseUrls = {
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  commentServiceBaseUrl: string;
  digitalCockpitApiBaseUrl: string;
  discoverApiBaseUrl: string;
  infieldApiBaseUrl: string;
  infieldCacheApiBaseUrl: string;
  userManagementServiceBaseUrl: string;
  simconfigApiBaseUrl: string;
};

export type SidecarConfig = ApiBaseUrls & {
  __sidecarFormatVersion: number;
  aadApplicationId?: string;
  AADTenantID?: string;
  applicationId: string;
  applicationName: string;
  backgroundImage?: string;
  cdfCluster: string;
  directoryTenantId?: string;
  disableAzureLogin?: boolean;
  disableLegacyLogin?: boolean;
  disableTranslations?: boolean;
  docsSiteBaseUrl: string;
  enableUserManagement?: boolean;
  fakeIdp?: FakeIdp[];
  helpLink?: string;
  intercom?: string;
  intercomSettings?: IntercomBootSettings;
  localServices?: Service[];
  locize?: {
    apiKey?: string;
    projectId: string;
    version?: string;
    keySeparator?: false | string;
  };
  privacyPolicyUrl: string;
  simconfigApiBaseUrl: string;
};
