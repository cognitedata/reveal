import React, { useCallback } from 'react';

import styled from 'styled-components';

import { Loader, SearchEmpty } from '@data-exploration/components';
import { RowSelectionState, Updater } from '@tanstack/react-table';
import noop from 'lodash/noop';

import {
  ResourceItem,
  ResourceType,
  SelectableItemsProps,
} from '@data-exploration-lib/core';

import {
  AssetDetails,
  DocumentDetails,
  EventDetails,
  SequenceDetails,
  TimeseriesDetails,
} from '../ResourceDetails';

import { ResourceSelection } from './ResourceSelector';
import { extractResourcesFromSelection, getResourceSelection } from './utils';

type Props = {
  item?: ResourceItem;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  closable?: boolean;
  onClose?: () => void;
  hideTitle?: boolean;
  hideContent?: boolean;
  selectedRows?: ResourceSelection;
  visibleResources?: ResourceType[];
  isDocumentsApiEnabled?: boolean;
  showSelectButton?: boolean;
  onSelect?: (selection: ResourceSelection, resources: ResourceItem[]) => void;
} & Omit<Partial<SelectableItemsProps>, 'onSelect'>;

const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;
const ResourcePreviewPlaceholder = () => {
  return (
    <Centered>
      <SearchEmpty />
      <p>No resource to preview.</p>
    </Centered>
  );
};

export const ResourceSelectorDetails = ({
  item,
  placeholder = ResourcePreviewPlaceholder(),
  header,
  footer,
  content: propContent,
  closable,
  onClose = noop,
  selectedRows,
  selectionMode = 'single',
  onSelect = noop,
  isSelected = false,
  hideContent = false,
  visibleResources = [],
  isDocumentsApiEnabled = true,
  showSelectButton,
}: Props) => {
  const handleSelect = useCallback(
    (
      updater?: Updater<RowSelectionState>,
      currentData?: ResourceItem[],
      resourceType?: ResourceType
    ) => {
      const selection = getResourceSelection({
        item,
        selectedRows,
        updater,
        currentData,
        resourceType,
      });
      const resources = extractResourcesFromSelection(selection);

      onSelect(selection, resources);
    },
    [item, onSelect, selectedRows]
  );

  const commonProps = {
    closable,
    onSelect: handleSelect,
    selectedRows,
    selectionMode,
    visibleResources,
    showSelectButton,
  };

  let content: React.ReactNode = placeholder || <Loader />;

  if (item) {
    switch (item.type) {
      case 'asset': {
        content = (
          <AssetDetails
            assetId={item.id}
            isSelected={isSelected}
            onClose={onClose}
            {...commonProps}
          />
        );
        break;
      }
      case 'file': {
        content = (
          <DocumentDetails
            documentId={item.id}
            isSelected={isSelected}
            onClose={onClose}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            {...commonProps}
          />
        );
        break;
      }
      case 'sequence': {
        content = (
          <SequenceDetails
            sequenceId={item.id}
            isSelected={isSelected}
            onClose={onClose}
            {...commonProps}
          />
        );
        break;
      }
      case 'timeSeries': {
        content = (
          <TimeseriesDetails
            timeseriesId={item.id}
            isSelected={isSelected}
            onClose={onClose}
            {...commonProps}
          />
        );
        break;
      }
      case 'event': {
        content = (
          <EventDetails
            eventId={item.id}
            isSelected={isSelected}
            onClose={onClose}
            {...commonProps}
          />
        );
        break;
      }
    }
  }

  return (
    <ResourcePreviewSidebarContainer>
      {header}
      {!hideContent && (propContent || content)}
      {footer}
    </ResourcePreviewSidebarContainer>
  );
};

const ResourcePreviewSidebarContainer = styled.div`
  min-width: 360px;
`;
