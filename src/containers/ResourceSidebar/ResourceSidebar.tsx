import React, { useState, useContext, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { FilePreview } from 'containers/Files';
import { AssetPreview } from 'containers/Assets';
import { SequencePreview } from 'containers/Sequences';
import { TimeseriesPreview } from 'containers/Timeseries';
import { GlobalSearchResults } from 'containers/GlobalSearch/GlobalSearchResults';
import ResourceActionsContext from 'context/ResourceActionsContext';
import { RenderResourceActionsFunction } from 'types/Types';
import { ResourceItem } from 'context/ResourceSelectionContext';
import { ResourceType } from 'modules/sdk-builder/types';

const Drawer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 64px;
  right: 0;
  width: ${props => (props.visible ? '80vw' : '0')};
  height: calc(100vh - 64px);
  z-index: 4;
  background: #fff;
  transition: 0.3s all;
  && > div {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;
const Overlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 64px;
  right: 0;
  width: 100vw;
  height: calc(100vh - 64px);
  z-index: 3;
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props =>
    props.visible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0,0,0,0)'};
  transition: 0.3s all;
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
`;

export const ResourceSidebar = ({
  visible = false,
  onClose,
  children,
}: {
  onClose: () => void;
  visible?: boolean;
  children?: React.ReactNode;
}) => {
  const [query, setQuery] = useState<string>('');
  const { add, remove } = useContext(ResourceActionsContext);
  const [selectedItem, setSelectedItem] = useState<ResourceItem | undefined>(
    undefined
  );

  const renderResourceActions: RenderResourceActionsFunction = useCallback(
    ({ fileId, assetId, timeseriesId, sequenceId }) => {
      let resourceName = 'Resource';
      let resourceType: ResourceType | undefined;
      if (fileId) {
        resourceName = 'File';
        resourceType = 'files';
      }
      if (assetId) {
        resourceName = 'Asset';
        resourceType = 'assets';
      }
      if (timeseriesId) {
        resourceName = 'Time Series';
        resourceType = 'timeseries';
      }
      if (sequenceId) {
        resourceName = 'Sequence';
        resourceType = 'sequences';
      }
      const viewButton = () => {
        if (resourceType) {
          return (
            <Button
              type="secondary"
              key="view"
              onClick={() => {
                setSelectedItem({
                  type: resourceType!,
                  id: (fileId || assetId || timeseriesId || sequenceId)!,
                });
              }}
              icon="ArrowRight"
            >
              View {resourceName}
            </Button>
          );
        }
        return null;
      };

      return [viewButton()];
    },
    []
  );

  useEffect(() => {
    add('cart', renderResourceActions);
  }, [add, renderResourceActions]);

  useEffect(() => {
    return () => {
      remove('cart');
    };
  }, [remove]);

  let content = null;

  if (selectedItem) {
    let preview = null;
    switch (selectedItem.type) {
      case 'assets': {
        preview = <AssetPreview assetId={selectedItem.id} />;
        break;
      }
      case 'timeseries': {
        preview = <TimeseriesPreview timeseriesId={selectedItem.id} />;
        break;
      }
      case 'sequences': {
        preview = <SequencePreview sequenceId={selectedItem.id} />;
        break;
      }
      case 'files': {
        preview = <FilePreview fileId={selectedItem.id} />;
        break;
      }
    }
    content = (
      <>
        <Button
          variant="ghost"
          icon="ArrowLeft"
          onClick={() => setSelectedItem(undefined)}
          style={{ alignSelf: 'flex-start' }}
        >
          Back to search
        </Button>
        {preview}
      </>
    );
  } else {
    content = (
      <>
        <Input
          variant="noBorder"
          icon="Search"
          fullWidth
          iconPlacement="left"
          placeholder="Search..."
          onChange={ev => setQuery(ev.target.value)}
          value={query}
        />
        <GlobalSearchResults query={query} />
      </>
    );
  }

  return (
    <>
      <Drawer visible={visible}>
        {visible && (
          <div>
            <CloseButton icon="Close" variant="ghost" onClick={onClose} />
            {children}
            {content}
          </div>
        )}
      </Drawer>
      <Overlay onClick={onClose} visible={visible} />
    </>
  );
};
