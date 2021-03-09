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
  disableLoopDetector?: boolean;
  helpLink?: string;
  locizeProjectId?: string;
};
