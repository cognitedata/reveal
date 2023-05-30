import {
  AssetDetails,
  EventDetails,
  TimeseriesDetails,
} from '@data-exploration/containers';
import React from 'react';
import styled from 'styled-components';

import noop from 'lodash/noop';

import { Loader, SearchEmpty } from '@data-exploration/components';
import { ResourceItem, SelectableItemsProps } from '@data-exploration-lib/core';

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
} & Partial<SelectableItemsProps>;

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
  actions,
  footer,
  content: propContent,
  onClose = noop,
  onSelect = noop,
  isSelected = false,
  hideTitle = false,
  hideContent = false,
}: Props) => {
  const commonProps = { onSelect, isSelected, actions };
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
          //TODO Replace this new file Details Page
          <div>Placeholder for file preview</div>
          //   <FileSmallPreview
          //     hideTitle={hideTitle}
          //     fileId={item.id}
          //     {...commonProps}
          //   />
        );
        break;
      }
      case 'sequence': {
        content = (
          //TODO Replace this new sequence Details Page
          <div> Placeholder for sequence Preview</div>
          //   <SequenceSmallPreview
          //     hideTitle={hideTitle}
          //     sequenceId={item.id}
          //     {...commonProps}
          //   />
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
            eventItem={item}
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
