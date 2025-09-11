import { formatDateTime } from '@cognite/cdf-utilities';
import { createContext } from 'react';
import { revokeObjectUrl } from './utils/revokeObjectUrl';

export type Image360HistoricalDetailsViewModelDependencies = {
  formatDateTime: typeof formatDateTime;
  revokeObjectUrl: typeof revokeObjectUrl;
};

export const defaultImage360HistoricalDetailsViewModelDependencies: Image360HistoricalDetailsViewModelDependencies =
  {
    formatDateTime,
    revokeObjectUrl
  };

export const Image360HistoricalDetailsViewModelContext =
  createContext<Image360HistoricalDetailsViewModelDependencies>(
    defaultImage360HistoricalDetailsViewModelDependencies
  );
