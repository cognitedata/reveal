/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useState, useCallback } from 'react';

import {
  ResourceItem,
  ResourceItemState,
  InitialResourceFilterProps,
  SelectableItemsProps,
  ResourceType,
} from '@data-exploration-components/types';

import { Dropdown, Select, Tabs, Tooltip } from '@cognite/cogs.js';

import { ResourceSelectionSidebar } from '..';

export type OpenSelectorProps = {
  /** Callback for when the selector is closed */
  onClose?: (confirmed: boolean, results?: ResourceItem[]) => void;
  initialItemState?: ResourceItemState[];
  header?: React.ReactNode;
  resourceTypes?: ResourceType[];
} & Omit<SelectableItemsProps, 'isSelected'> &
  InitialResourceFilterProps;

export type ResourceSelector = {
  openResourceSelector: (props?: OpenSelectorProps) => void;
  hideResourceSelector: () => void;
};

const ResourceSelectorContext = React.createContext({} as ResourceSelector);

export const useResourceSelector = () => {
  const observer = useContext(ResourceSelectorContext);
  return observer;
};
/**
 * @param  appendStyles: keep this false if we append styles in parent components
 */

export const ResourceSelectorProvider = ({
  children,
  appendStyles = false,
}: {
  children: React.ReactNode;
  appendStyles?: boolean;
}) => {
  const [resourceTypes, setResourceTypes] = useState<
    ResourceType[] | undefined
  >(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [props, setProps] = useState<Omit<SelectableItemsProps, 'isSelected'>>({
    selectionMode: 'single',
    onSelect: () => {},
  });
  const [resourceItemState, setResourceItemState] = useState<
    ResourceItemState[]
  >([]);
  const [onClose, setOnCloseCallback] = useState<
    (confirmed: boolean, results?: ResourceItem[]) => void
  >(() => () => {});
  const [onSelect, setOnSelectListener] = useState<
    SelectableItemsProps['onSelect']
  >(() => () => {});

  React.useEffect(() => {
    if (!appendStyles) return;

    Tooltip.defaultProps = {
      ...Tooltip.defaultProps,
      appendTo: () => document.body,
    };

    // defaultProps does not exist on type
    // @ts-expect-error
    Tabs.defaultProps = {
      // @ts-expect-error
      ...Tabs.defaultProps,
      getPopupContainer: () => document.body,
    };

    // @ts-expect-error
    Select.defaultProps = {
      // @ts-expect-error
      ...Select.defaultProps,
      menuPortalTarget: document.body,
    };

    // @ts-expect-error
    Dropdown.defaultProps = {
      // @ts-expect-error
      ...Dropdown.defaultProps,
      appendTo: () => document.body,
    };

    // create a custom portal for drag-drop
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add('drag-drop-portal');
    document.body.appendChild(dragDropPortal);
  }, []);

  const openResourceSelector = useCallback(
    (
      {
        onClose: propsOnClose = () => {},
        onSelect: propsOnSelect = () => {},
        selectionMode = 'single',
        initialItemState = [],
        resourceTypes,
        ...selectionProps
      }: OpenSelectorProps = {
        onClose: () => {},
        onSelect: () => {},
        selectionMode: 'single',
        initialItemState: [],
      }
    ) => {
      setResourceTypes(resourceTypes);
      setProps({
        selectionMode,
        onSelect,
        ...selectionProps,
      });
      setOnCloseCallback(() => propsOnClose);
      setOnSelectListener(() => (item: ResourceItem) => {
        propsOnSelect(item);
        if (selectionMode === 'single') {
          setIsOpen(false);
          setResourceItemState((value) => {
            propsOnClose(
              true,
              value.filter((el) => el.state === 'selected')
            );
            return [];
          });
          setOnCloseCallback(() => () => {});
        } else {
          setResourceItemState((items) => {
            const newItems = items.filter(
              (el) => !(el.id === item.id && el.type === item.type)
            );
            return newItems.length !== items.length
              ? newItems
              : [...items, { ...item, state: 'selected' }];
          });
        }
      });
      setResourceItemState(initialItemState);
      setIsOpen(true);
    },
    [onSelect]
  );

  const hideResourceSelector = useCallback(() => {
    setIsOpen(false);
    setOnCloseCallback(() => () => {});
  }, []);

  return (
    <ResourceSelectorContext.Provider
      value={{
        openResourceSelector,
        hideResourceSelector,
      }}
    >
      {children}
      {/* <ResourceSelector visible={isOpen} onClose={() => setIsOpen(false)} /> */}
      <ResourceSelectionSidebar
        onClose={(success) => {
          onClose(
            success,
            resourceItemState.filter((el) => el.state === 'selected')
          );
          hideResourceSelector();
        }}
        visible={isOpen}
        {...props}
        selectionMode={props.selectionMode || 'single'}
        isSelected={(item) =>
          resourceItemState.some(
            (el) =>
              el.state === 'selected' &&
              el.id === item.id &&
              el.type === item.type
          )
        }
        onSelect={onSelect}
        resourceTypes={resourceTypes}
      />
    </ResourceSelectorContext.Provider>
  );
};

export default ResourceSelectorContext;
