import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

export const getMockTrajectoryChartConfig =
  (): ProjectConfigWellsTrajectoryCharts[] => [
    {
      type: 'line',
      chartData: {
        x: 'x_offset',
        y: 'y_offset',
      },
      reverseXAxis: false,
      reverseYAxis: false,
      reverseZAxis: false,
      chartExtraData: {
        hovertemplate: '%{y}',
      },
      chartVizData: {
        axisNames: {
          x: 'West East (<%= unit %>)',
          y: 'South North (<%= unit %>)',
        },
        title: 'NS vs EW',
      },
    },
    {
      type: 'line',
      chartData: {
        x: 'y_offset',
        y: 'tvd',
      },
      reverseXAxis: false,
      reverseYAxis: true,
      reverseZAxis: false,
      chartExtraData: {
        hovertemplate: '%{y}',
      },
      chartVizData: {
        axisNames: {
          x: 'South North (<%= unit %>)',
          y: 'True Vertical Depth (<%= unit %>)',
        },
        title: 'TVD vs NS',
      },
    },
    {
      type: 'line',
      chartData: {
        x: 'x_offset',
        y: 'tvd',
      },
      reverseXAxis: false,
      reverseYAxis: true,
      reverseZAxis: false,
      chartExtraData: {
        hovertemplate: '%{y}',
      },
      chartVizData: {
        axisNames: {
          x: 'West East (<%= unit %>)',
          y: 'True Vertical Depth (<%= unit %>)',
        },
        title: 'TVD vs EW',
      },
    },
    {
      type: 'line',
      chartData: {
        x: 'ed',
        y: 'tvd',
      },
      reverseXAxis: false,
      reverseYAxis: true,
      reverseZAxis: false,
      chartExtraData: {
        hovertemplate: '%{y}',
      },
      chartVizData: {
        axisNames: {
          x: 'Equivalent Departure (<%= unit %>)',
          y: 'True Vertical Depth (<%= unit %>)',
        },
        title: 'TVD vs ED',
      },
    },
    {
      type: '3d',
      chartData: {
        x: 'x_offset',
        y: 'y_offset',
        z: 'tvd',
      },
      reverseXAxis: false,
      reverseYAxis: false,
      reverseZAxis: true,
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
    },
    {
      type: 'legend',
      chartData: {
        x: 'x_offset',
        y: 'y_offset',
      },
      reverseYAxis: false,
      reverseXAxis: false,
      reverseZAxis: false,
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
    },
  ];
