import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Flex, Input } from '@cognite/cogs.js';
import {
  ResourceType,
  ResourceItem,
  SelectableItemsProps,
  InitialOldResourceFilterProps,
} from '@data-exploration-components/types';
import {
  Divider,
  ResourceTypeTabs,
  SpacedRow,
} from '@data-exploration-components/components';
import {
  SearchFilters,
  SearchResults,
  ResourcePreviewSidebar,
} from '@data-exploration-components/containers';

import { VerticalDivider } from '@data-exploration-components/components/Divider';
import {
  OldEventsFilters,
  OldTimeseriesFilters,
  OldSequenceFilters,
  InternalAssetFilters,
  InternalFilesFilters,
} from '@data-exploration-lib/core';
import zIndex from '@data-exploration-components/utils/zIndex';
import { ExplorationFilterToggle } from '@data-exploration/components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
  z-index: ${zIndex.DRAWER};
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 16px;
  left: -50px;
  background-color: white;
`;
const SidebarWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Drawer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: ${(props) => (props.visible ? '80vw' : '0')};
  height: 100%;
  z-index: ${zIndex.DRAWER};
  background: #fff;
  transition: 0.3s all;
  && > div {
    height: 100%;
    padding: 16px 16px 12px;
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
  z-index: ${zIndex.OVERLAY};
  display: ${(props) => (props.visible ? 'block' : 'none')};
  background-color: ${(props) =>
    props.visible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0,0,0,0)'};
  transition: 0.3s all;
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
  InitialOldResourceFilterProps) => {
  const [assetFilter, setAssetFilter] = useState<InternalAssetFilters>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] =
    useState<OldTimeseriesFilters>(initialTimeseriesFilter || {});
  const [fileFilter, setFileFilter] = useState<InternalFilesFilters>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<OldEventsFilters>(
    initialEventFilter || {}
  );
  const [sequenceFilter, setSequenceFilter] = useState<OldSequenceFilters>(
    initialSequenceFilter || {}
  );
  const [query, setQuery] = useState<string>('');
  const [activeKey, setActiveKey] = useState<ResourceType>(resourceTypes[0]);
  const [previewItem, setPreviewItem] = useState<ResourceItem | undefined>(
    undefined
  );
  const [showFilter, setShowFilter] = useState(false);

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
            <CloseButton icon="Close" onClick={() => onClose(false)} />
            {header}
            <SidebarWrapper>
              <Wrapper>
                <SearchFiltersWrapper>
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
                    visible={showFilter}
                  />
                </SearchFiltersWrapper>
                <MainSearchContainer>
                  <SearchInputContainer>
                    <>
                      <ExplorationFilterToggle
                        filterState={showFilter}
                        onClick={() => setShowFilter((prev) => !prev)}
                      />
                      <VerticalDivider />
                    </>
                    <Input
                      icon="Search"
                      fullWidth
                      size="large"
                      iconPlacement="left"
                      placeholder="Search..."
                      onChange={(ev) => setQuery(ev.target.value)}
                      value={query}
                    />
                  </SearchInputContainer>
                  <TabsContainer>
                    <ResourceTypeTabs
                      query={query}
                      resourceTypes={['file', 'asset']}
                      currentResourceType={activeKey}
                      setCurrentResourceType={(tab) => {
                        setActiveKey(tab as ResourceType);
                      }}
                    />
                  </TabsContainer>
                  <MainContainer $isFilterFeatureEnabled>
                    <SearchResults
                      isAssetTreeEnabled={false}
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
                      onClick={(item) => setPreviewItem(item)}
                    />
                  </MainContainer>
                </MainSearchContainer>
                {previewItem && (
                  <ResourcePreviewSidebarWrapper>
                    <ResourcePreviewSidebar
                      item={previewItem}
                      closable={true}
                      onClose={() => setPreviewItem(undefined)}
                      selectionMode={selectionMode}
                      onSelect={() => onSelect(previewItem)}
                      isSelected={isSelected(previewItem)}
                    />
                  </ResourcePreviewSidebarWrapper>
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
            </SidebarWrapper>
          </div>
        )}
      </Drawer>
      <Overlay onClick={() => onClose(false)} visible={visible} />
    </>
  );
};

const SearchFiltersWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
`;

const SearchInputContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 12px;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  /* width: calc(100% - 303px); */
  flex: 1;
  overflow: auto;
`;

const TabsContainer = styled.div`
  flex: 0 0 auto;
`;

const MainContainer = styled(Flex)<{ $isFilterFeatureEnabled?: boolean }>`
  padding-left: ${({ $isFilterFeatureEnabled }) =>
    $isFilterFeatureEnabled ? '0px' : '16px'};
  height: 100%;
  flex: 1;
  overflow: auto;
`;

const ResourcePreviewSidebarWrapper = styled.div`
  width: 360px;
  flex: 1;
  border-left: 1px solid var(--cogs-border--muted);
`;
