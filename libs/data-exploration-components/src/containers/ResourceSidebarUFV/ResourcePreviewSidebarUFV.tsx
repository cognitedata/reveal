import React from 'react';
import styled from 'styled-components';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreviewUFV } from 'containers/Assets';
import { FileSmallPreviewUFV } from 'containers/Files';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { EventSmallPreview } from 'containers/Events';
import { Loader } from 'components';
import { ResourceItem, SelectableItemProps } from 'types';

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
      <Graphic type="Search" />
      <p>No resource to preview.</p>
    </Centered>
  );
};

export const ResourcePreviewSidebarUFV = ({
  item,
  closable = true,
  placeholder = ResourcePreviewPlaceholder,
  header,
  actions,
  footer,
  content: propContent,
  onClose = () => {},
  selectionMode = 'none',
  onSelect = () => {},
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
          <AssetSmallPreviewUFV
            hideTitle={hideTitle}
            assetId={item.id}
            {...commonProps}
          />
        );
        break;
      }
      case 'file': {
        content = (
          <FileSmallPreviewUFV
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
