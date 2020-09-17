/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { ModalProps, Loader } from '@cognite/cogs.js';
import { CogniteClient } from 'cognite-sdk-v3';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { createBrowserHistory } from 'history';
import configureStoreProd from 'store/storeProd';
import { createPreserveQueryAndHashHistory } from 'store/history';
import { setSDK } from 'utils/SDK';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { ClientSDKProvider } from '@cognite/gearbox';

export const history = createPreserveQueryAndHashHistory(createBrowserHistory, [
  'env',
  'apikey',
])();

let store = configureStoreProd();

export type DataExplorationProps = {
  content?: React.ReactNode;
} & Omit<Omit<ModalProps, 'children'>, 'visible'>;

export type DataExplorationContextObserver = {
  sdk: CogniteClient;
};

export const DataExplorationContext = React.createContext(
  {} as DataExplorationContextObserver
);

const DataExplorationProvider = ({
  children,
  sdk,
}: {
  children: React.ReactNode;
  sdk: CogniteClient;
}) => {
  const [isStoreReady, setIsStoreReady] = useState<boolean>(false);
  useEffect(() => {
    setSDK(sdk);
    store = configureStoreProd();
    setIsStoreReady(true);
  }, [sdk]);
  if (!isStoreReady) {
    return <Loader />;
  }
  return (
    <DataExplorationContext.Provider value={{ sdk }}>
      <ClientSDKProvider client={sdk}>
        <CogniteResourceProvider sdk={sdk} store={store}>
          <ResourcePreviewProvider>
            <ResourceSelectorProvider>
              <ResourceSelectionProvider>
                <ResourceActionsProvider>{children}</ResourceActionsProvider>
              </ResourceSelectionProvider>
            </ResourceSelectorProvider>
          </ResourcePreviewProvider>
        </CogniteResourceProvider>
      </ClientSDKProvider>
    </DataExplorationContext.Provider>
  );
};

export { DataExplorationProvider };
export default DataExplorationContext;
