export const getChartType = (type?: string) => {
  switch (type) {
    case 'line':
      return 'scatter';
    case '3d':
      return 'scatter3d';
    default:
      return 'scatter';
  }
};
