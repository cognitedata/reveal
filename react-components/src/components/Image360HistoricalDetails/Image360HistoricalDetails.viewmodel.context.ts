import { formatDateTime } from '@cognite/cdf-utilities';
import { createContext } from 'react';

export type Image360HistoricalDetailsViewModelDependencies = {
  formatDateTime: typeof formatDateTime;
};

export const defaultImage360HistoricalDetailsViewModelDependencies: Image360HistoricalDetailsViewModelDependencies =
  {
    formatDateTime
  };

export const Image360HistoricalDetailsViewModelContext =
  createContext<Image360HistoricalDetailsViewModelDependencies>(
    defaultImage360HistoricalDetailsViewModelDependencies
  );
