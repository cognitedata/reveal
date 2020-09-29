import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { FilePreview } from 'containers/Files';
import { AssetPreview } from 'containers/Assets';
import { SequencePreview } from 'containers/Sequences';
import { TimeseriesPreview } from 'containers/Timeseries';
import { EventPreview } from 'containers/Events';
import { SearchResults } from 'containers/SearchResults';
import { RenderResourceActionsFunction } from 'types/Types';
import {
  ResourceActionsContext,
  ResourcePreviewProvider,
  useQuery,
  useResourcesState,
  useResourceMode,
  useResourceTypes,
} from 'context';
import { ResourceItem, ResourceType } from 'types';
import { Divider, SpacedRow } from 'components/Common';

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

export const SelectionSidebarContent = ({
  visible = false,
  onClose,
  children,
}: {
  onClose: (confirmed: boolean) => void;
  visible?: boolean;
  children?: React.ReactNode;
}) => {
  const [query, setQuery] = useQuery();
  const { add, remove } = useContext(ResourceActionsContext);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();
  const [selectedItem, setSelectedItem] = useState<ResourceItem | undefined>(
    undefined
  );
  const resourceTypes = useResourceTypes();
  const [activeKey, setActiveKey] = useState<ResourceType>(resourceTypes[0]);

  const selectResourcesCount = useMemo(
    () => resourcesState.filter(el => el.state === 'selected').length,
    [resourcesState]
  );

  useEffect(() => {
    setSelectedItem(undefined);
  }, [visible]);

  const renderResourceActions: RenderResourceActionsFunction = useCallback(
    resourceItem => {
      let resourceName = 'Resource';
      const resourceType = resourceItem?.type;
      switch (resourceItem?.type) {
        case 'file': {
          resourceName = 'File';
          break;
        }
        case 'asset': {
          resourceName = 'Asset';
          break;
        }
        case 'timeSeries': {
          resourceName = 'Time series';
          break;
        }
        case 'sequence': {
          resourceName = 'Sequence';
          break;
        }
        case 'event': {
          resourceName = 'Event';
          break;
        }
      }
      const viewButton = () => {
        if (
          resourceType &&
          selectedItem?.id !== resourceItem.id &&
          selectedItem?.type !== resourceItem.type
        ) {
          return (
            <Button
              type="secondary"
              key="view"
              onClick={() => {
                setSelectedItem(resourceItem);
              }}
              icon="ArrowRight"
            >
              View {resourceName.toLowerCase()}
            </Button>
          );
        }
        return null;
      };

      return [viewButton()];
    },
    [selectedItem]
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
      case 'asset': {
        preview = <AssetPreview assetId={selectedItem.id} />;
        break;
      }
      case 'timeSeries': {
        preview = <TimeseriesPreview timeseriesId={selectedItem.id} />;
        break;
      }
      case 'sequence': {
        preview = <SequencePreview sequenceId={selectedItem.id} />;
        break;
      }
      case 'event': {
        preview = <EventPreview eventId={selectedItem.id} />;
        break;
      }
      case 'file': {
        preview = <FilePreview fileId={selectedItem.id} />;
        break;
      }
    }
    content = (
      <ResourcePreviewProvider>
        <Button
          variant="ghost"
          icon="ArrowLeft"
          onClick={() => setSelectedItem(undefined)}
          style={{ alignSelf: 'flex-start' }}
        >
          Back to search
        </Button>
        {preview}
      </ResourcePreviewProvider>
    );
  } else {
    content = (
      <>
        <Input
          icon="Search"
          fullWidth
          size="large"
          iconPlacement="left"
          placeholder="Search..."
          onChange={ev => setQuery(ev.target.value)}
          value={query}
        />
        <SearchResults
          currentResourceType={activeKey}
          setCurrentResourceType={setActiveKey}
        />
      </>
    );
  }

  return (
    <>
      <Drawer visible={visible}>
        {visible && (
          <div>
            <CloseButton
              icon="Close"
              variant="ghost"
              onClick={() => onClose(false)}
            />
            {children}
            {content}

            {mode !== 'none' && (
              <>
                <Divider.Horizontal />
                <SpacedRow>
                  <Button onClick={() => onClose(false)}>Cancel</Button>
                  <div className="spacer" />
                  <Button type="primary" onClick={() => onClose(true)}>
                    Select {selectResourcesCount} Resources
                  </Button>
                </SpacedRow>
              </>
            )}
          </div>
        )}
      </Drawer>
      <Overlay onClick={() => onClose(false)} visible={visible} />
    </>
  );
};
