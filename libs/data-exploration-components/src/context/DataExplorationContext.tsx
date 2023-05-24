import React, { useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ResourcePreviewProvider } from '@data-exploration-components/context/ResourcePreviewContext';
import { ResourceSelectorProvider } from '@data-exploration-components/context/ResourceSelectorContext';
import { FileContextualizationContextProvider } from '@data-exploration-components/context/FileContextualization';
import { SDKProvider } from '@cognite/sdk-provider';
import {
  Flow,
  OverrideURLMap,
  MetricsMetadata,
} from '@data-exploration-lib/core';
import { Tooltip, Tabs, Select } from '@cognite/cogs.js';
import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';
import { AppContextProvider } from './AppContext';

export type DataExplorationProviderProps = {
  flow: Flow;
  overrideURLMap?: OverrideURLMap;
  sdk: CogniteClient;
  userInfo: any;
  styleScopeId?: string;
  trackUsage?: (event: string, metadata?: MetricsMetadata) => void;
  isAdvancedFiltersEnabled?: boolean;
};

export const DataExplorationProvider = ({
  children,
  flow,
  overrideURLMap,
  sdk,
  userInfo,
  styleScopeId,
  trackUsage,
  isAdvancedFiltersEnabled = false,
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

    // @ts-expect-error
    Select.defaultProps = {
      // @ts-expect-error
      ...Select.defaultProps,
      menuPortalTarget: document.getElementsByClassName(styleScopeId).item(0)!,
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
      <AppContextProvider
        flow={flow}
        overrideURLMap={overrideURLMap}
        userInfo={userInfo}
        isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
        trackUsage={trackUsage}
      >
        <FileContextualizationContextProvider>
          <ResourcePreviewProvider>
            <ResourceSelectorProvider>{children}</ResourceSelectorProvider>
          </ResourcePreviewProvider>
        </FileContextualizationContextProvider>
      </AppContextProvider>
    </SDKProvider>
  );
};
