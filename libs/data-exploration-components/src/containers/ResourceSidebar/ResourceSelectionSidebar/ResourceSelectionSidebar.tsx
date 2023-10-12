import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import {
  VerticalDivider,
  ExplorationFilterToggle,
} from '@data-exploration/components';
import isEqual from 'lodash/isEqual';

import { Button, Flex, Input } from '@cognite/cogs.js';

import {
  InternalEventsFilters,
  OldSequenceFilters,
  InternalAssetFilters,
  InternalFilesFilters,
  InternalTimeseriesFilters,
  zIndex,
} from '@data-exploration-lib/core';

import { Divider, ResourceTypeTabs, SpacedRow } from '../../../components';
import { usePrevious } from '../../../hooks';
import {
  InitialOldResourceFilterProps,
  ResourceItem,
  ResourceType,
  SelectableItemsProps,
} from '../../../types';
import { SearchFilters, SearchResults } from '../../SearchResults';
import { ResourcePreviewSidebar } from '../ResourcePreviewSidebar';

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
  margin-left: 20px;
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
  isolation: isolate;
  width: ${(props) => (props.visible ? '80vw' : '0')};
  height: 100%;
  z-index: ${zIndex.DRAWER};
  background: #fff;
  transition: 0.3s all;
  && > div {
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
  const previousResourceTypes = usePrevious(resourceTypes);
  const [assetFilter, setAssetFilter] = useState<InternalAssetFilters>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] =
    useState<InternalTimeseriesFilters>(initialTimeseriesFilter || {});
  const [fileFilter, setFileFilter] = useState<InternalFilesFilters>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<InternalEventsFilters>(
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
    if (
      !resourceTypes.includes(activeKey) ||
      // The resourceType order might have changed
      !isEqual(previousResourceTypes, resourceTypes)
    ) {
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
                    <InputWrapper>
                      <Input
                        size="large"
                        variant="noBorder"
                        autoFocus
                        fullWidth
                        icon="Search"
                        placeholder="Search..."
                        onChange={(ev) => setQuery(ev.target.value)}
                        value={query}
                      />
                    </InputWrapper>

                    {!previewItem && (
                      <CloseButton
                        icon="Close"
                        onClick={() => {
                          if (previewItem) {
                            setPreviewItem(undefined);
                          } else onClose(false);
                        }}
                      />
                    )}
                  </SearchInputContainer>
                  <TabsContainer>
                    <ResourceTypeTabs
                      query={query}
                      resourceTypes={resourceTypes}
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
                      onSelect={() => onSelect?.(previewItem)}
                      isSelected={isSelected(previewItem)}
                    />
                  </ResourcePreviewSidebarWrapper>
                )}
              </Wrapper>
              {children}
              {selectionMode !== 'none' && (
                <>
                  <Divider.Horizontal />
                  <StyledSpacedRow>
                    <div className="spacer" />
                    <Button
                      type="primary"
                      disabled={!previewItem}
                      onClick={() => {
                        if (selectionMode === 'single') {
                          if (previewItem) {
                            onSelect?.(previewItem);
                            return;
                          }
                        }

                        if (selectionMode === 'multiple') {
                          onClose(true);
                          return;
                        }
                      }}
                    >
                      Add selected resources
                    </Button>
                  </StyledSpacedRow>
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

const StyledSpacedRow = styled(SpacedRow)`
  padding: 0 12px;
  padding-bottom: 8px;
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
const InputWrapper = styled.div`
  width: 93%;
`;
