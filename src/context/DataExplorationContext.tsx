import React, { useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { FileContextualizationContextProvider } from 'context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { Flow, AppContextProvider, OverrideURLMap } from './AppContext';
import { Tooltip } from '@cognite/cogs.js';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
  styleScopeId?: string;
};

export const DataExplorationProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
  styleScopeId,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (!styleScopeId) return;

    Tooltip.defaultProps = {
      ...Tooltip.defaultProps,
      appendTo: () => document.getElementsByClassName(styleScopeId).item(0)!,
    };
  }, [styleScopeId]);

  return (
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
};
