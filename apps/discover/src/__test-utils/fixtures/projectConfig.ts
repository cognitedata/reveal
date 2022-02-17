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
      field_block_operator_filter: {
        operator: {
          enabled: true,
        },
        field: {
          enabled: true,
        },
        region: {
          enabled: true,
        },
        block: {
          enabled: false,
        },
      },
    },
    ...extras,
  };
};
