import { createContext } from 'react';
import { Image360HistoricalPanel } from './Panel/Image360HistoricalPanel';
import { Image360HistoricalSummary } from './Toolbar/Image360HistoricalSummary';
import { useImage360HistoricalDetailsViewModel } from './Image360HistoricalDetails.viewmodel';

export type Image360HistoricalDetailsDependencies = {
  Image360HistoricalPanel: typeof Image360HistoricalPanel;
  Image360HistoricalSummary: typeof Image360HistoricalSummary;
  useImage360HistoricalDetailsViewModel: typeof useImage360HistoricalDetailsViewModel;
};

export const defaultImage360HistoricalDetailsDependencies: Image360HistoricalDetailsDependencies = {
  Image360HistoricalPanel,
  Image360HistoricalSummary,
  useImage360HistoricalDetailsViewModel
};

export const Image360HistoricalDetailsContext =
  createContext<Image360HistoricalDetailsDependencies>(
    defaultImage360HistoricalDetailsDependencies
  );
