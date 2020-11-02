import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'lib/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'lib/context/ResourceSelectorContext';
import { ResourceActionsProvider } from 'lib/context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'lib/context/ResourceSelectionContext';
import { FileContextualizationContextProvider } from 'lib/context/FileContextualization';
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
        <ResourceSelectionProvider>
          <ResourceActionsProvider>
            <ResourcePreviewProvider>
              <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
            </ResourcePreviewProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </SDKProvider>
  );
};
