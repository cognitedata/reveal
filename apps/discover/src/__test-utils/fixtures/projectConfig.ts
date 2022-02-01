import { ProjectConfig } from '@cognite/discover-api-types';

export const getMockConfig = (
  extras?: Partial<ProjectConfig>
): ProjectConfig => {
  return {
    general: {
      enableWellSDKV3: true,
    },
    wells: {
      disabled: false,
    },
    ...extras,
  };
};
