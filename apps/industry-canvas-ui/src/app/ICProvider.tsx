import React from 'react';

import { AppContextProvider } from '@data-exploration-components/context/AppContext';
import { FileContextualizationContextProvider } from '@data-exploration-components/context/FileContextualization';
import { ResourcePreviewProvider } from '@data-exploration-components/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from '@data-exploration-components/context/ResourceSelectorContext';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { Flow, OverrideURLMap } from '@data-exploration-lib/core';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
  isAdvancedFiltersEnabled?: boolean;
};

export const ICProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
  isAdvancedFiltersEnabled = false,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  return (
    <SDKProvider sdk={sdk}>
      <AppContextProvider
        flow={flow}
        overrideURLMap={overrideURLMap}
        userInfo={userInfo}
        isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
      >
        <FileContextualizationContextProvider>
          <ResourcePreviewProvider>
            <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
          </ResourcePreviewProvider>
        </FileContextualizationContextProvider>
      </AppContextProvider>
    </SDKProvider>
  );
};
