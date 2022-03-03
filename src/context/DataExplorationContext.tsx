import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { FileContextualizationContextProvider } from 'context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { Flow, AppContextProvider, OverrideURLMap } from './AppContext';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
};

export const DataExplorationProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => (
  <SDKProvider sdk={sdk}>
    <CogniteFileViewer.Provider
      sdk={sdk}
      disableAutoFetch
      overrideURLMap={{
        ...(overrideURLMap?.pdfjsWorkerSrc && {
          pdfjsWorkerSrc: overrideURLMap?.pdfjsWorkerSrc,
        }),
      }}
    >
      <AppContextProvider
        flow={flow}
        overrideURLMap={overrideURLMap}
        userInfo={userInfo}
      >
        <FileContextualizationContextProvider>
          <ResourcePreviewProvider>
            <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
          </ResourcePreviewProvider>
        </FileContextualizationContextProvider>
      </AppContextProvider>
    </CogniteFileViewer.Provider>
  </SDKProvider>
);
