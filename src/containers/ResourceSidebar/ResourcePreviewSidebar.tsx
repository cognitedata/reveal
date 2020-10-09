import React from 'react';
import styled from 'styled-components';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { EventSmallPreview } from 'containers/Events';
import { Loader } from 'components/Common';
import { ResourceItem } from 'types';

type Props = {
  item?: ResourceItem;
  closable?: boolean;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  onClose: () => void;
};

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
  footer,
  content: propContent,
  onClose,
}: Props) => {
  let content: React.ReactNode = placeholder || <Loader />;
  if (item) {
    switch (item.type) {
      case 'asset': {
        content = <AssetSmallPreview assetId={item.id} />;
        break;
      }
      case 'file': {
        content = <FileSmallPreview fileId={item.id} />;
        break;
      }
      case 'sequence': {
        content = <SequenceSmallPreview sequenceId={item.id} />;
        break;
      }
      case 'timeSeries': {
        content = <TimeseriesSmallPreview timeseriesId={item.id} />;
        break;
      }
      case 'event': {
        content = <EventSmallPreview eventId={item.id} />;
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
