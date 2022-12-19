import React, { useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from '@data-exploration-components/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from '@data-exploration-components/context/ResourceSelectorContext';
import { ResourcePreviewProviderUFV } from '@data-exploration-components/context/ResourcePreviewContextUFV';
import { ResourceSelectorProviderUFV } from '@data-exploration-components/context/ResourceSelectorContextUFV';
import { FileContextualizationContextProvider } from '@data-exploration-components/context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { Flow, AppContextProvider, OverrideURLMap } from './AppContext';
import { Tooltip, Tabs } from '@cognite/cogs.js';
import { MetricsMetadata } from '@data-exploration-components/hooks/useMetrics';
import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration-components/components/DragDropContainer/constants';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
  styleScopeId?: string;
  trackUsage?: (event: string, metadata?: MetricsMetadata) => void;
};

export const DataExplorationProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
  styleScopeId,
  trackUsage,
}: DataExplorationProviderProps & {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (!styleScopeId) return;

    Tooltip.defaultProps = {
      ...Tooltip.defaultProps,
      appendTo: () => document.getElementsByClassName(styleScopeId).item(0)!,
    };

    // defaultProps does not exist on type
    // @ts-expect-error
    Tabs.defaultProps = {
      // @ts-expect-error
      ...Tabs.defaultProps,
      getPopupContainer: () =>
        document.getElementsByClassName(styleScopeId).item(0)!,
    };

    // create a custom portal for drag-drop
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add(DRAG_DROP_PORTAL_CLASS);
    document
      .getElementsByClassName(styleScopeId)
      .item(0)!
      .appendChild(dragDropPortal);
  }, [styleScopeId]);

  return (
    <SDKProvider sdk={sdk}>
      <CogniteFileViewer.Provider
        // The addition of Annotations API requires a bump in the sdk which react-picture-annotations
        // does not support yet. We'll be removing the old file viewer within days so this is a temporary
        // solution until then
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
          trackUsage={trackUsage}
        >
          <FileContextualizationContextProvider>
            <ResourcePreviewProvider>
              <ResourceSelectorProvider>
                <ResourcePreviewProviderUFV>
                  <ResourceSelectorProviderUFV>
                    {children}
                  </ResourceSelectorProviderUFV>
                </ResourcePreviewProviderUFV>
              </ResourceSelectorProvider>
            </ResourcePreviewProvider>
          </FileContextualizationContextProvider>
        </AppContextProvider>
      </CogniteFileViewer.Provider>
    </SDKProvider>
  );
};
