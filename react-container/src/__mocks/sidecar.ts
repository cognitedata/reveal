import { SidecarConfig } from '@cognite/react-tenant-selector';

export const generateSidecar = (): SidecarConfig => {
  return {
    __sidecarFormatVersion: 1,
    aadApplicationId: '',
    AADTenantID: '',
    applicationId: '',
    applicationName: '',
    appsApiBaseUrl: '',
    backgroundImage: '',
    cdfApiBaseUrl: '',
    cdfCluster: '',
    disableTranslations: false,
    helpLink: '',
    locizeProjectId: '',
  };
};
