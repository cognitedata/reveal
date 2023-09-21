import React from 'react';

import styled from 'styled-components';

import { Loader, SearchEmpty } from '@data-exploration/components';
import {
  AssetDetails,
  DocumentDetails,
  EventDetails,
  ResourceSelection,
  SequenceDetails,
  TimeseriesDetails,
} from '@data-exploration/containers';
import noop from 'lodash/noop';

import { ResourceItem, SelectableItemProps } from '../../types';

type Props = {
  item?: ResourceItem;
  closable?: boolean;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  onClose?: () => void;
  hideTitle?: boolean;
  hideContent?: boolean;
  selectedRows?: ResourceSelection;
} & Partial<SelectableItemProps>;

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

export const ResourcePreviewSidebar = ({
  item,
  placeholder = ResourcePreviewPlaceholder(),
  header,

  footer,
  content: propContent,
  onClose = noop,
  selectedRows,
  onSelect = noop,
  isSelected = false,
  hideContent = false,
}: Props) => {
  const commonProps = { selectedRows, onSelect };
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
  height: 100%;
`;
