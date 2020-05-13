type SidecarConfig = {
  appsApiBaseUrl: string;
  applicationId: string;
  applicationName: string;
  backgroundImage: string;
  helpLink: string;
};

const DEFAULT_SIDECAR: SidecarConfig = {
  appsApiBaseUrl: 'https://localhost',
  applicationId: 'tenant-selector-test',
  applicationName: 'Tenant Selector Test',
  backgroundImage: '',
  helpLink: '',
};

export default (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (window as any).__cogniteSidecar || DEFAULT_SIDECAR;
};
