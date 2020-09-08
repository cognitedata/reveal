/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  ResourceSelectionProvider,
  ResourceSelectionProps,
} from 'context/ResourceSelectionContext';
import { ResourceActionsProvider } from 'context/ResourceActionsContext';
import { SelectionSidebarContent } from './SelectionSidebarContent';

export const ResourceSelectionSidebar = ({
  children,
  visible,
  onClose,
  ...selectionProps
}: {
  children?: React.ReactNode;
  visible: boolean;
  onClose: (confirmed: boolean) => void;
} & ResourceSelectionProps) => {
  return (
    <ResourceActionsProvider>
      <ResourceSelectionProvider
        {...(selectionProps as ResourceSelectionProps)}
      >
        <SelectionSidebarContent onClose={onClose} visible={visible}>
          {children}
        </SelectionSidebarContent>
      </ResourceSelectionProvider>
    </ResourceActionsProvider>
  );
};
