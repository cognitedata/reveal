import React from 'react';
import styled from 'styled-components';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files';
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
