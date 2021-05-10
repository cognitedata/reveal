// we need to make a more generic place to move this type into

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
  directoryTenantId?: string;
  disableTranslations?: boolean;
  disableLegacyLogin?: boolean;
  helpLink?: string;
  intercom?: string;
  locizeProjectId?: string;
  locizeKeySeparator?: false | string;
};
