import { createContext } from 'react';
import { formatDateTime } from '../../utilities/date-time-utils';

export type Image360HistoricalDetailsViewModelDependencies = {
  formatDateTime: typeof formatDateTime;
  revokeObjectUrl: typeof globalThis.URL.revokeObjectURL;
};

export const defaultImage360HistoricalDetailsViewModelDependencies: Image360HistoricalDetailsViewModelDependencies =
  {
    formatDateTime,
    revokeObjectUrl: (url: string) => {
      globalThis.URL.revokeObjectURL(url);
    }
  };

export const Image360HistoricalDetailsViewModelContext =
  createContext<Image360HistoricalDetailsViewModelDependencies>(
    defaultImage360HistoricalDetailsViewModelDependencies
  );
