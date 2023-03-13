import { usePatchTrajectoryChartConfig } from './usePatchTrajectoryChartConfig';

export const useTrajectoryChartConfigMdVsEd = () => {
  return usePatchTrajectoryChartConfig(
    { x: 'ed', y: 'tvd' },
    {
      chartData: {
        x: 'ed',
        y: 'md',
      },
      chartVizData: {
        axisNames: {
          x: 'Horizontal Departure (<%= unit %>)',
          y: 'Measured Depth (<%= unit %>)',
        },
        title: 'MD vs HD',
      },
    }
  );
};
