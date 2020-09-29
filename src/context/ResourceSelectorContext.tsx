/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useCallback } from 'react';
import { ResourceSelectionSidebar } from 'containers/ResourceSidebar';
import { ResourceSelectionProps } from 'context/ResourceSelectionContext';
import { ResourceItem } from 'types';
import {
  ResourceItemState,
  OnSelectListener,
} from './ResourceSelectionContext';

export type OpenSelectorProps = ResourceSelectionProps & {
  /** Callback for when the selector is closed */
  onClose?: (confirmed: boolean) => void;
};

export type ResourceSelector = {
  openResourceSelector: (props?: OpenSelectorProps) => void;
  hideResourceSelector: () => void;
};

const ResourceSelectorContext = React.createContext({} as ResourceSelector);

export const useResourceSelector = () => {
  const observer = useContext(ResourceSelectorContext);
  return observer;
};

export const ResourceSelectorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [props, setProps] = useState<ResourceSelectionProps>({});
  const [resourceItemState, setResourceItemState] = useState<
    ResourceItemState[]
  >([]);
  const [onClose, setOnCloseCallback] = useState<(confirmed: boolean) => void>(
    () => () => {}
  );
  const [onSelect, setOnSelectListener] = useState<OnSelectListener>(
    () => () => {}
  );

  const openResourceSelector = useCallback(
    (
      {
        onClose: propsOnClose = () => {},
        onSelect: propsOnSelect = () => {},
        resourcesState: propsResourceItemState = [],
        mode = 'single',
        ...selectionProps
      }: OpenSelectorProps = {
        onClose: () => {},
        onSelect: () => {},
        resourcesState: [],
        mode: 'single',
      }
    ) => {
      setProps({
        allowEdit: false,
        mode,
        ...selectionProps,
      });
      setOnCloseCallback(() => propsOnClose);
      setOnSelectListener(() => (item: ResourceItem) => {
        propsOnSelect(item);
        if (mode === 'single') {
          setIsOpen(false);
          setOnCloseCallback(() => () => {});
          propsOnClose(true);
        } else {
          setResourceItemState(value => [
            ...value,
            { ...item, state: 'selected' },
          ]);
        }
      });
      setResourceItemState(propsResourceItemState);
      setIsOpen(true);
    },
    []
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
      <ResourceSelectionSidebar
        onClose={() => {
          onClose(false);
          hideResourceSelector();
        }}
        visible={isOpen}
        {...props}
        onSelect={onSelect}
        resourcesState={resourceItemState}
      />
    </ResourceSelectorContext.Provider>
  );
};

export default ResourceSelectorContext;
