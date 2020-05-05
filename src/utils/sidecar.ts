type SidecarConfig = {
  appsApiBaseUrl: string;
  applicationId: string;
  appName: string;
  backgroundImage: string;
};

const DEFAULT_SIDECAR: SidecarConfig = {
  appsApiBaseUrl: 'https://localhost',
  applicationId: 'tenant-selector-test',
  appName: 'Tenant Selector Test',
  backgroundImage: '',
};

export default (): SidecarConfig => {
  // eslint-disable-next-line no-underscore-dangle
  return (window as any).__cogniteSidecar || DEFAULT_SIDECAR;
};
