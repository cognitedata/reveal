import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  useRelatedResourceCounts,
  ResourceType,
  ResourceItem,
  getTitle,
} from '@cognite/data-exploration';
import { Badge, Colors, Tabs, TabPaneProps } from '@cognite/cogs.js';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { RelatedResources } from 'app/containers/ResourceDetails/RelatedResources/RelatedResources';

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
  const { counts } = useRelatedResourceCounts(parentResource);

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
      style={{ flex: 1, overflow: 'auto' }}
      key={key}
      tab={
        <TabWrapper>
          <div>{getTitle(key)}</div>
          <Badge
            style={{ alignSelf: 'flex-end' }}
            text={key === 'asset' ? assetCount : counts[key]!}
            background={Colors['greyscale-grey3'].hex()}
          />
        </TabWrapper>
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
  flex: 1;
  overflow: auto;
  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
  .rc-tabs-content-holder {
    display: flex;
  }
`;

export const TabTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const TabWrapper = styled.div`
  display: flex;
  align-items: center;
`;
