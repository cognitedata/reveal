import React from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { useChartAtom } from '../../models/chart/atom';

import { useExportToCSV } from './hooks';

export interface CSVModalContextInterface {
  useExportToCSV: typeof useExportToCSV;
  useChartAtom: typeof useChartAtom;
  useSDK: typeof useSDK;
}

export const CSVModalContext = React.createContext<CSVModalContextInterface>({
  useExportToCSV,
  useChartAtom,
  useSDK,
});
