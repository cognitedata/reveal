import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { SearchResultFilters } from 'lib/components/Search/Filters';
import {
  SearchResult,
  Wrapper as SearchResultWrapper,
} from 'lib/components/Search/SearchResult';
import { RenderResourceActionsFunction } from 'lib/types/Types';
import {
  ResourceActionsContext,
  useQuery,
  useResourcesState,
  useResourceMode,
  useResourceTypes,
} from 'lib/context';
import { ResourceItem, ResourceType } from 'lib/types';
import { Divider, SpacedRow } from 'lib/components';

const Drawer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${props => (props.visible ? '80vw' : '0')};
  height: 100%;
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
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100%;
  z-index: 3;
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props =>
    props.visible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0,0,0,0)'};
  transition: 0.3s all;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
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

  useEffect(() => {
    if (!resourceTypes.includes(activeKey)) {
      setActiveKey(resourceTypes[0]);
    }
  }, [activeKey, resourceTypes]);

  const selectResourcesCount = useMemo(
    () => resourcesState.filter(el => el.state === 'selected').length,
    [resourcesState]
  );

  useEffect(() => {
    setSelectedItem(undefined);
  }, [visible, activeKey]);

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
            <Wrapper>
              <SearchResultFilters visible currentResourceType={activeKey} />
              <SearchResultWrapper>
                <Input
                  icon="Search"
                  fullWidth
                  size="large"
                  iconPlacement="left"
                  placeholder="Search..."
                  onChange={ev => setQuery(ev.target.value)}
                  value={query}
                />
                <SearchResult query={query} type={activeKey} />
              </SearchResultWrapper>
            </Wrapper>

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
