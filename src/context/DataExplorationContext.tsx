import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { FileContextualizationContextProvider } from 'context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';

export type DataExplorationProviderProps = {
  sdk: CogniteClient;
};

export const DataExplorationProvider = ({
  children,
  sdk,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => (
  <SDKProvider sdk={sdk}>
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
      <FileContextualizationContextProvider>
        <ResourcePreviewProvider>
          <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
        </ResourcePreviewProvider>
      </FileContextualizationContextProvider>
    </CogniteFileViewer.Provider>
  </SDKProvider>
);
