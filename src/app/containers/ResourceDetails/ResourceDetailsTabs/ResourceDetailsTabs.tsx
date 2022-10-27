import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  useRelatedResourceCounts,
  ResourceType,
  ResourceItem,
  getTitle,
} from '@cognite/data-exploration';
import { Colors, Tabs, TabPaneProps, Label } from '@cognite/cogs.js';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { RelatedResources } from 'app/containers/ResourceDetails/RelatedResources/RelatedResources';
import { addPlusSignToCount } from 'app/utils/stringUtils';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem;
  tab: string;
  additionalTabs?: React.ReactElement<TabPaneProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
  style?: React.CSSProperties;
};

const defaultRelationshipTabs: ResourceType[] = [
  'asset',
  'file',
  'timeSeries',
  'event',
  'sequence',
];

const ResourceDetailTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const navigate = useNavigate();

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      el =>
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  return (
    <RelatedResources
      type={type}
      parentResource={resource}
      onItemClicked={(id: number) => {
        navigate(createLink(`/explore/${type}/${id}`));
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};

export const ResourceDetailsTabs = ({
  parentResource,
  tab,
  additionalTabs = [],
  excludedTypes = [],
  onTabChange,
  style = {},
}: ResouceDetailsTabsProps) => {
  const { counts, hasMoreRelationships } =
    useRelatedResourceCounts(parentResource);

  const filteredTabs = defaultRelationshipTabs.filter(
    type => !excludedTypes.includes(type)
  );

  let assetCount = counts.asset || '0';
  if (parentResource.type === 'asset') {
    const assetCountWithoutSeparator = assetCount.split(',').join('');
    let parsedAssetCount = parseInt(assetCountWithoutSeparator, 10);
    parsedAssetCount = Number.isNaN(parsedAssetCount) ? 0 : parsedAssetCount;
    parsedAssetCount =
      parentResource.type === 'asset'
        ? Math.max(parsedAssetCount - 1, 0)
        : parsedAssetCount;
    assetCount = parsedAssetCount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const relationshipTabs = filteredTabs.map(key => (
    <Tabs.TabPane
      key={key}
      tab={
        <>
          <TabTitle>{getTitle(key)}</TabTitle>
          <Label size="small" variant="unknown">
            {addPlusSignToCount(
              key === 'asset' ? assetCount : counts[key]!,
              hasMoreRelationships[key]!
            )}
          </Label>
        </>
      }
    >
      <ResourceDetailTabContent
        resource={parentResource}
        type={key as ResourceType}
      />
    </Tabs.TabPane>
  ));
  const tabs = [...additionalTabs, ...relationshipTabs];

  return (
    <StyledTabs
      padding="default"
      style={style}
      activeKey={tab}
      onChange={onTabChange}
    >
      {tabs}
    </StyledTabs>
  );
};

const StyledTabs = styled(Tabs)`
  padding-left: 16px;
  padding-right: 16px;
  flex: 1;
  height: 100%;

  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .rc-tabs-content-holder {
    display: flex;
    /* We need to consider the height of the tab switcher part at the top which is 48px in height */
    height: calc(100% - 48px);
    overflow: auto;
  }
`;

export const TabTitle = styled.span`
  margin-right: 8px;
`;
