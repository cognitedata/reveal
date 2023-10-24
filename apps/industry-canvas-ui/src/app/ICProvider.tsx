import React from 'react';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import {
  AppContextProvider,
  FileContextualizationContextProvider,
} from '@data-exploration-components';
import { Flow, OverrideURLMap } from '@data-exploration-lib/core';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
};

export const ICProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  return (
    <SDKProvider sdk={sdk}>
      <AppContextProvider
        flow={flow}
        overrideURLMap={overrideURLMap}
        userInfo={userInfo}
      >
        <FileContextualizationContextProvider>
          {children}
        </FileContextualizationContextProvider>
      </AppContextProvider>
    </SDKProvider>
  );
};
