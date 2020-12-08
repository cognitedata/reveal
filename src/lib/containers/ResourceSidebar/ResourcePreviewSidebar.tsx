import React from 'react';
import styled from 'styled-components';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'lib/containers/Assets';
import { FileSmallPreview } from 'lib/containers/Files';
import { SequenceSmallPreview } from 'lib/containers/Sequences';
import { TimeseriesSmallPreview } from 'lib/containers/Timeseries';
import { EventSmallPreview } from 'lib/containers/Events';
import { Loader } from 'lib/components';
import { ResourceItem } from 'lib/types';
import { SelectableItemProps } from 'lib/CommonProps';

type Props = {
  item?: ResourceItem;
  closable?: boolean;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  onClose?: () => void;
} & Partial<SelectableItemProps>;

export const ResourcePreviewSidebar = ({
  item,
  closable = true,
  placeholder = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Graphic type="Search" />
      <p>No resource to preview.</p>
    </div>
  ),
  header,
  actions,
  footer,
  content: propContent,
  onClose = () => {},
  selectionMode = 'none',
  onSelect = () => {},
  isSelected = false,
}: Props) => {
  const commonProps = { selectionMode, onSelect, isSelected, actions };
  let content: React.ReactNode = placeholder || <Loader />;
  if (item) {
    switch (item.type) {
      case 'asset': {
        content = <AssetSmallPreview assetId={item.id} {...commonProps} />;
        break;
      }
      case 'file': {
        content = <FileSmallPreview fileId={item.id} {...commonProps} />;
        break;
      }
      case 'sequence': {
        content = (
          <SequenceSmallPreview sequenceId={item.id} {...commonProps} />
        );
        break;
      }
      case 'timeSeries': {
        content = (
          <TimeseriesSmallPreview timeseriesId={item.id} {...commonProps} />
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
    <ResourcePreviewWrapper>
      {closable && (
        <CloseButton icon="Close" variant="ghost" onClick={onClose} />
      )}
      {header}
      {propContent || content}
      {footer}
    </ResourcePreviewWrapper>
  );
};

const ResourcePreviewWrapper = styled.div`
  height: 100%;
  min-width: 360px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
`;
