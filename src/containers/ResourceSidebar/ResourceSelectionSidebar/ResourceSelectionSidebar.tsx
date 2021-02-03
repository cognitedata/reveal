import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@cognite/cogs.js';
import { ResourceType, ResourceItem } from 'types';
import { Divider, SpacedRow, ResourceTypeTabs } from 'components';
import {
  SearchFilters,
  SearchResults,
  ResourcePreviewSidebar,
} from 'containers';
import { InitialResourceFilterProps, SelectableItemsProps } from 'CommonProps';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';

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

export const ResourceSelectionSidebar = ({
  resourceTypes = ['asset', 'timeSeries', 'file', 'event', 'sequence'],
  visible = false,
  onClose,
  children,
  header,
  selectionMode,
  onSelect,
  isSelected,
  initialAssetFilter,
  initialTimeseriesFilter,
  initialFileFilter,
  initialEventFilter,
  initialSequenceFilter,
}: {
  resourceTypes?: ResourceType[];
  onClose: (confirmed: boolean) => void;
  visible?: boolean;
  header?: React.ReactNode;
  children?: React.ReactNode;
} & SelectableItemsProps &
  InitialResourceFilterProps) => {
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    initialTimeseriesFilter || {}
  );
  const [fileFilter, setFileFilter] = useState<FileFilterProps>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<EventFilter>(
    initialEventFilter || {}
  );
  const [sequenceFilter, setSequenceFilter] = useState<
    Required<SequenceFilter>['filter']
  >(initialSequenceFilter || {});
  const [query, setQuery] = useState<string>('');
  const [activeKey, setActiveKey] = useState<ResourceType>(resourceTypes[0]);
  const [previewItem, setPreviewItem] = useState<ResourceItem | undefined>(
    undefined
  );

  useEffect(() => {
    if (!resourceTypes.includes(activeKey)) {
      setActiveKey(resourceTypes[0]);
    }
  }, [activeKey, resourceTypes]);

  useEffect(() => {
    setPreviewItem(undefined);
  }, [activeKey]);

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
            {header}
            <ResourceTypeTabs
              currentResourceType={activeKey}
              setCurrentResourceType={setActiveKey}
            />
            <Wrapper>
              <SearchFilters
                assetFilter={assetFilter}
                setAssetFilter={setAssetFilter}
                timeseriesFilter={timeseriesFilter}
                setTimeseriesFilter={setTimeseriesFilter}
                sequenceFilter={sequenceFilter}
                setSequenceFilter={setSequenceFilter}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
                fileFilter={fileFilter}
                setFileFilter={setFileFilter}
                resourceType={activeKey}
                allowHide={false}
              />
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
                <SearchResults
                  selectionMode={selectionMode}
                  onSelect={onSelect}
                  isSelected={isSelected}
                  assetFilter={assetFilter}
                  timeseriesFilter={timeseriesFilter}
                  sequenceFilter={sequenceFilter}
                  eventFilter={eventFilter}
                  fileFilter={fileFilter}
                  resourceType={activeKey}
                  query={query}
                  onClick={item => setPreviewItem(item)}
                />
              </SearchResultWrapper>
              {previewItem && (
                <div style={{ width: 360, flex: 1 }}>
                  <ResourcePreviewSidebar
                    item={previewItem}
                    closable={false}
                    selectionMode={selectionMode}
                    onSelect={() => onSelect(previewItem)}
                    isSelected={isSelected(previewItem)}
                  />
                </div>
              )}
            </Wrapper>
            {children}

            {selectionMode !== 'none' && (
              <>
                <Divider.Horizontal />
                <SpacedRow>
                  <Button onClick={() => onClose(false)}>Cancel</Button>
                  <div className="spacer" />
                  <Button type="primary" onClick={() => onClose(true)}>
                    Select Resources
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

const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  overflow: hidden;
  height: 100%;
`;
