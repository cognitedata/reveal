export const getTrajectoryChartType = (type?: string) => {
  switch (type) {
    case 'line':
      return 'scatter';
    case '3d':
      return 'scatter3d';
    default:
      return 'scatter';
  }
};
