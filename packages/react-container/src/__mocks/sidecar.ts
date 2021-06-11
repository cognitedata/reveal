import { SidecarConfig } from '@cognite/react-tenant-selector';

export const generateSidecar = (): SidecarConfig => ({
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
  locize: {
    projectId: '',
  },
});
