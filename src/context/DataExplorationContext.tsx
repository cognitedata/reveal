import React from 'react';
import { ModalProps } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { ClientSDKProvider } from '@cognite/gearbox';
import { SDKProvider } from './sdk';

export type DataExplorationProps = {
  content?: React.ReactNode;
} & Omit<Omit<ModalProps, 'children'>, 'visible'>;

export type DataExplorationContextObserver = {
  sdk: CogniteClient;
};

export const DataExplorationContext = React.createContext(
  {} as DataExplorationContextObserver
);

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
    <DataExplorationContext.Provider value={{ sdk }}>
      <SDKProvider sdk={sdk}>
        <ClientSDKProvider client={sdk}>
          <ResourceSelectionProvider>
            <ResourceActionsProvider>
              <ResourcePreviewProvider>
                <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
              </ResourcePreviewProvider>
            </ResourceActionsProvider>
          </ResourceSelectionProvider>
        </ClientSDKProvider>
      </SDKProvider>
    </DataExplorationContext.Provider>
  );
};

export default DataExplorationContext;
