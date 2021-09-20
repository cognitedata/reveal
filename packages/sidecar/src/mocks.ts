import { getDefaultSidecar } from 'getDefaultSidecar';
import { SidecarConfig } from 'types';

export const mockSidecar = (
  override: Partial<SidecarConfig> = {}
): SidecarConfig => {
  return {
    ...getDefaultSidecar({
      prod: false,
      cluster: 'ew1',
    }),
    __sidecarFormatVersion: 1,
    aadApplicationId: '',
    applicationId: '',
    applicationName: '',
    ...override,
  } as SidecarConfig;
};
