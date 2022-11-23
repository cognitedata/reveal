import React, { useContext, useState, useCallback } from 'react';
import { ResourceSelectionSidebarUFV } from 'containers/ResourceSidebarUFV';
import {
  ResourceItem,
  ResourceItemState,
  InitialResourceFilterProps,
  SelectableItemsProps,
  ResourceType,
} from 'types';

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

export const useResourceSelectorUFV = () => {
  const observer = useContext(ResourceSelectorContext);
  return observer;
};

export const ResourceSelectorProviderUFV = ({
  children,
}: {
  children: React.ReactNode;
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
          setResourceItemState(value => {
            propsOnClose(
              true,
              value.filter(el => el.state === 'selected')
            );
            return [];
          });
          setOnCloseCallback(() => () => {});
        } else {
          setResourceItemState(items => {
            const newItems = items.filter(
              el => !(el.id === item.id && el.type === item.type)
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
      <ResourceSelectionSidebarUFV
        onClose={success => {
          onClose(
            success,
            resourceItemState.filter(el => el.state === 'selected')
          );
          hideResourceSelector();
        }}
        visible={isOpen}
        {...props}
        selectionMode={props.selectionMode || 'single'}
        isSelected={item =>
          resourceItemState.some(
            el =>
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
