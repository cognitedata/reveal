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
import { SDKProvider } from './sdk';

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

export type DataExplorationProviderProps = {
  sdk: CogniteClient;
  store?: ReturnType<typeof configureStoreProd>;
};

export const DataExplorationProvider = ({
  children,
  sdk,
  store: storeProps,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  const [isStoreReady, setIsStoreReady] = useState<boolean>(false);
  useEffect(() => {
    setSDK(sdk);
    if (!storeProps) {
      store = configureStoreProd();
    } else {
      store = storeProps;
    }
    setIsStoreReady(true);
  }, [sdk, storeProps]);
  if (!isStoreReady) {
    return <Loader />;
  }
  return (
    <DataExplorationContext.Provider value={{ sdk }}>
      <SDKProvider sdk={sdk}>
        <ClientSDKProvider client={sdk}>
          <CogniteResourceProvider sdk={sdk} store={store}>
            <ResourceSelectionProvider>
              <ResourceActionsProvider>
                <ResourcePreviewProvider>
                  <ResourceSelectorProvider>
                    {children}
                  </ResourceSelectorProvider>
                </ResourcePreviewProvider>
              </ResourceActionsProvider>
            </ResourceSelectionProvider>
          </CogniteResourceProvider>
        </ClientSDKProvider>
      </SDKProvider>
    </DataExplorationContext.Provider>
  );
};

export default DataExplorationContext;
