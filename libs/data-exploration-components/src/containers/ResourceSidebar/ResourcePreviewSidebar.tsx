import React from 'react';

import styled from 'styled-components';

import { Loader, SearchEmpty } from '@data-exploration/components';
import {
  AssetDetails,
  DocumentDetails,
  EventDetails,
  SequenceDetails,
  TimeseriesDetails,
} from '@data-exploration/containers';
import {
  ResourceItem,
  SelectableItemProps,
} from '@data-exploration-components/types';
import noop from 'lodash/noop';

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
  actions,
  footer,
  content: propContent,
  onClose = noop,
  selectionMode = 'none',
  onSelect = noop,
  isSelected = false,
  hideTitle = false,
  hideContent = false,
}: Props) => {
  const commonProps = { selectionMode, onSelect, isSelected };
  let content: React.ReactNode = placeholder || <Loader />;
  if (item) {
    switch (item.type) {
      case 'asset': {
        content = (
          <AssetDetails
            assetId={item.id}
            isSelected={isSelected}
            onClose={onClose}
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
