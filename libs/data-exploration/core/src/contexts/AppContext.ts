import React from 'react';

import { MetricsMetadata } from '../hooks';

export type Flow =
  | 'COGNITE_AUTH'
  | 'AZURE_AD'
  | 'ADFS'
  | 'OAUTH_GENERIC'
  | 'FAKE_IDP'
  | 'UNKNOWN';

export type OverrideURLMap = {
  pdfjsWorkerSrc?: string;
} & Record<string, string>;

export type AppContextProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  userInfo: any;
  isAdvancedFiltersEnabled: boolean;
  trackUsage?: (event: string, metadata?: MetricsMetadata) => void;
};
export const AppContext = React.createContext<AppContextProps | null>(null);
