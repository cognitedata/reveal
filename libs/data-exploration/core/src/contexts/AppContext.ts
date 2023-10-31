import React from 'react';

import { IDPType } from '@cognite/login-utils';

import { MetricsMetadata } from '../hooks';

export type Flow = IDPType | 'FAKE_IDP' | 'UNKNOWN';

export type OverrideURLMap = {
  pdfjsWorkerSrc?: string;
} & Record<string, string>;

export type AppContextProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  userInfo: any;
  trackUsage?: (event: string, metadata?: MetricsMetadata) => void;
  isDocumentsApiEnabled?: boolean;
};
export const AppContext = React.createContext<AppContextProps | null>(null);
