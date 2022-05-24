import { ProjectConfig } from '@cognite/discover-api-types';

export const getMockConfig = (
  extras?: Partial<ProjectConfig>
): ProjectConfig => {
  return {
    wells: {
      disabled: false,
      filters: {},
      overview: { enabled: true },
      nds: { enabled: true },
      npt: { enabled: true },
      nds_filter: { enabled: true },
      npt_filter: { enabled: true },
      data_source_filter: { enabled: false },
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
      measurements: {
        enabled: true,
      },
      well_characteristics_filter: {
        well_type: { enabled: true },
        kb_elevation: { enabled: false },
        tvd: { enabled: false },
        maximum_inclination_angle: { enabled: false },
        spud_date: { enabled: true },
        water_depth: { enabled: true },
      },
      measurements_filter: { enabled: true },
    },
    ...extras,
  };
};
