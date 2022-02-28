import { IconType } from '@cognite/cogs.js';
import { ResourceType } from 'types/core';

export const mapResourceTypeToIcon = (resourceType: ResourceType): IconType => {
  switch (resourceType) {
    case 'assets':
      return 'Assets';
    case 'timeseries':
      return 'Timeseries';
    case 'files':
      return 'Document';
    case 'threeD':
      return 'Cube';
    case 'boards':
      return 'Boards';
    case 'charts':
      return 'LineChart';
    default:
      return 'Placeholder';
  }
};

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
