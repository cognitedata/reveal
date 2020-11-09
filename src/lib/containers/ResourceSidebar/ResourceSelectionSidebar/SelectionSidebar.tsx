import React from 'react';
import {
  ResourceSelectionProvider,
  ResourceSelectionProps,
} from 'lib/context/ResourceSelectionContext';
import { ResourceActionsProvider } from 'lib/context/ResourceActionsContext';
import { SelectableItemsProps } from 'lib/CommonProps';
import { SelectionSidebarContent } from './SelectionSidebarContent';

// TODO(CDFUX-0) add story for these
export const ResourceSelectionSidebar = ({
  children,
  visible,
  onClose,
  ...selectionProps
}: {
  children?: React.ReactNode;
  visible: boolean;
  onClose: (confirmed: boolean) => void;
} & ResourceSelectionProps &
  SelectableItemsProps) => {
  return (
    <ResourceActionsProvider>
      <ResourceSelectionProvider
        {...(selectionProps as ResourceSelectionProps)}
      >
        <SelectionSidebarContent
          onClose={onClose}
          visible={visible}
          {...selectionProps}
        >
          {children}
        </SelectionSidebarContent>
      </ResourceSelectionProvider>
    </ResourceActionsProvider>
  );
};
