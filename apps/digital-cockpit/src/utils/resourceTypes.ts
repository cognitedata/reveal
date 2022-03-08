import { ResourceType } from 'types/core';

export const mapResourceTypeToLabel = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case 'assets':
      return 'Assets';
    case 'timeseries':
      return 'Time series';
    case 'files':
      return 'Files';
    case 'threeD':
      return '3D';
    case 'boards':
      return 'Boards';
    case 'charts':
      return 'Charts';
    default:
      return '';
  }
};
