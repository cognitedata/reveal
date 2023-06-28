import React from 'react';

import { useChartAtom } from '@charts-app/models/chart/atom';

import { useSDK } from '@cognite/sdk-provider';

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
