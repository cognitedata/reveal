import { IntercomBootSettings } from '@cognite/intercom-helper';

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
  | 'west-europe-1';

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

export type SidecarConfig = {
  __sidecarFormatVersion: number;
  aadApplicationId?: string;
  AADTenantID?: string;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  backgroundImage?: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  commentServiceBaseUrl: string;
  digitalCockpitApiBaseUrl: string;
  directoryTenantId?: string;
  disableAzureLogin?: boolean;
  disableLegacyLogin?: boolean;
  disableTranslations?: boolean;
  discoverApiBaseUrl: string;
  docsSiteBaseUrl: string;
  enableUserManagement?: boolean;
  fakeIdp?: FakeIdp[];
  helpLink?: string;
  intercom?: string;
  intercomSettings?: IntercomBootSettings;
  locize?: {
    apiKey?: string;
    projectId: string;
    version?: string;
    keySeparator?: false | string;
  };
  userManagementServiceBaseUrl: string;
};
