import {
  ProjectConfig,
  ProjectConfigWellsTrajectoryCharts,
} from '@cognite/discover-api-types';

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

export const getMockLineGraphProjectConfigWellsTrajectoryChart = (
  extras?: ProjectConfigWellsTrajectoryCharts
): ProjectConfigWellsTrajectoryCharts => {
  return {
    type: 'line',
    chartData: {
      x: 'x_offset',
      y: 'y_offset',
    },
    chartExtraData: {
      hovertemplate: '%{y}',
    },
    chartVizData: {
      axisNames: {
        x: 'East West (<%= unit %>)',
        y: 'North South (<%= unit %>)',
      },
      title: 'NS vs EW',
    },
    ...extras,
  };
};

export const getMock3dGraphProjectConfigWellsTrajectoryChart = (
  extras?: ProjectConfigWellsTrajectoryCharts
): ProjectConfigWellsTrajectoryCharts => {
  return {
    type: '3d',
    chartData: {
      x: 'x_offset',
      y: 'y_offset',
      z: 'tvd',
    },
    chartExtraData: {
      hovertemplate: 'EW: %{x}<br>NS: %{y}<br>TVD: %{z}',
    },
    chartVizData: {
      axisNames: {
        x: 'East West (<%= unit %>)',
        y: 'North South (<%= unit %>)',
        z: 'TVD (<%= unit %>)',
      },
      title: 'TVD 3D view',
    },
    ...extras,
  };
};

export const getMockLegendGraphProjectConfigWellsTrajectoryChart = (
  extras?: ProjectConfigWellsTrajectoryCharts
): ProjectConfigWellsTrajectoryCharts => {
  return {
    type: 'legend',
    chartData: {
      x: 'x_offset',
      y: 'y_offset',
    },
    chartExtraData: {
      hovertemplate: '%{y}',
    },
    chartVizData: {
      axisNames: {
        x: 'East West',
        y: 'North South',
        z: 'TVD',
      },
      title: '',
    },
    ...extras,
  };
};

export const getMockProjectConfigWellsTrajectoryCharts =
  (): ProjectConfigWellsTrajectoryCharts[] => {
    return [
      getMockLineGraphProjectConfigWellsTrajectoryChart(),
      getMock3dGraphProjectConfigWellsTrajectoryChart(),
      getMockLegendGraphProjectConfigWellsTrajectoryChart(),
    ];
  };
