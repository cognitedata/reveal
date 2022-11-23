import React, { useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from 'context/ResourcePreviewContext';
import { ResourceSelectorProvider } from 'context/ResourceSelectorContext';
import { ResourcePreviewProviderUFV } from 'context/ResourcePreviewContextUFV';
import { ResourceSelectorProviderUFV } from 'context/ResourceSelectorContextUFV';
import { FileContextualizationContextProvider } from 'context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { Flow, AppContextProvider, OverrideURLMap } from './AppContext';
import { Tooltip } from '@cognite/cogs.js';
import { MetricsMetadata } from 'hooks/useMetrics';

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
  }, [styleScopeId]);

  return (
    <SDKProvider sdk={sdk}>
      <CogniteFileViewer.Provider
        // The addition of Annotations API requires a bump in the sdk which react-picture-annotations
        // does not support yet. We'll be removing the old file viewer within days so this is a temporary
        // solution until then
        // @ts-expect-error
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
