import React from 'react';
import styled from 'styled-components';
import { Button, Illustrations } from '@cognite/cogs.js';
import { AssetSmallPreview } from '@data-exploration-components/containers/Assets';
import { FileSmallPreview } from '@data-exploration-components/containers/Files';
import { SequenceSmallPreview } from '@data-exploration-components/containers/Sequences';
import { TimeseriesSmallPreview } from '@data-exploration-components/containers/Timeseries';
import { EventSmallPreview } from '@data-exploration-components/containers/Events';
import { Loader } from '@data-exploration-components/components';
import noop from 'lodash/noop';
import {
  ResourceItem,
  SelectableItemProps,
} from '@data-exploration-components/types';
import { SearchEmpty } from '@data-exploration-components/graphics';

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
  closable = true,
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
  const commonProps = { selectionMode, onSelect, isSelected, actions };
  let content: React.ReactNode = placeholder || <Loader />;
  if (item) {
    switch (item.type) {
      case 'asset': {
        content = (
          <AssetSmallPreview
            hideTitle={hideTitle}
            assetId={item.id}
            {...commonProps}
          />
        );
        break;
      }
      case 'file': {
        content = (
          <FileSmallPreview
            hideTitle={hideTitle}
            fileId={item.id}
            {...commonProps}
          />
        );
        break;
      }
      case 'sequence': {
        content = (
          <SequenceSmallPreview
            hideTitle={hideTitle}
            sequenceId={item.id}
            {...commonProps}
          />
        );
        break;
      }
      case 'timeSeries': {
        content = (
          <TimeseriesSmallPreview
            hideTitle={hideTitle}
            timeseriesId={item.id}
            {...commonProps}
          />
        );
        break;
      }
      case 'event': {
        content = <EventSmallPreview eventId={item.id} {...commonProps} />;
        break;
      }
    }
  }

  return (
    <ResourcePreviewSidebarContainer>
      {closable && <CloseButton icon="Close" type="ghost" onClick={onClose} />}
      {header}
      {!hideContent && (propContent || content)}
      {footer}
    </ResourcePreviewSidebarContainer>
  );
};

const ResourcePreviewSidebarContainer = styled.div`
  min-width: 360px;
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
`;
