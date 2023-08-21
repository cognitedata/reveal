import { useState } from 'react';

import {
  ResourceItem,
  ResourceSelectorFilter,
  ResourceType,
  useDialog,
} from '@data-exploration-lib/core';

export type OnResourceSelectorOpenPropsType = {
  // Opens the resource selector with the given resource selected (open in the details view).
  initialSelectedResourceItem?: ResourceItem;

  // Opens the resource selector with the given filter applied.
  initialFilter?: ResourceSelectorFilter;

  // Opens the resource selector with the given tab selected.
  initialTab?: ResourceType;

  shouldOnlyShowPreviewPane?: boolean;
};

export type UseResourceSelectorActionsReturnType = {
  onResourceSelectorClose: () => void;
  onResourceSelectorOpen: (arg?: OnResourceSelectorOpenPropsType) => void;
  isResourceSelectorOpen: boolean;
  resourceSelectorFilter: ResourceSelectorFilter | undefined;
  initialSelectedResource: ResourceItem | undefined;
  initialTab: ResourceType | undefined;
  shouldOnlyShowPreviewPane: boolean | undefined;
};

export const useResourceSelectorActions =
  (): UseResourceSelectorActionsReturnType => {
    const { open, close, isOpen } = useDialog();

    const [resourceSelectorOpenProps, setResourceSelectorOpenProps] = useState<
      OnResourceSelectorOpenPropsType | undefined
    >(undefined);

    const onResourceSelectorOpen: UseResourceSelectorActionsReturnType['onResourceSelectorOpen'] =
      (props) => {
        setResourceSelectorOpenProps(props);
        open();
      };

    return {
      onResourceSelectorClose: close,
      onResourceSelectorOpen,
      isResourceSelectorOpen: isOpen,
      resourceSelectorFilter: resourceSelectorOpenProps?.initialFilter,
      initialSelectedResource:
        resourceSelectorOpenProps?.initialSelectedResourceItem,
      initialTab: resourceSelectorOpenProps?.initialTab,
      shouldOnlyShowPreviewPane:
        resourceSelectorOpenProps?.shouldOnlyShowPreviewPane,
    };
  };
