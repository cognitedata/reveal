import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { FileContextualizationContextProvider } from 'context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';

export type DataExplorationProviderProps = {
  sdk: CogniteClient;
};

export const DataExplorationProvider = ({
  children,
  sdk,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  return (
    <SDKProvider sdk={sdk}>
      <FileContextualizationContextProvider>
        <ResourcePreviewProvider>
          <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
        </ResourcePreviewProvider>
      </FileContextualizationContextProvider>
    </SDKProvider>
  );
};
