import React from 'react';

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

export const AppContext = React.createContext<{
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  userInfo: any;
  trackUsage?: (event: string, metadata?: Record<string, unknown>) => void;
} | null>(null);
