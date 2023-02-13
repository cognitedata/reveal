import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  useRelatedResourceCounts,
  ResourceType,
  ResourceItem,
  getTitle,
} from '@cognite/data-exploration';
import { Colors, Tabs, TabsProps, Chip } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { RelatedResources } from '@data-exploration-app/containers/ResourceDetails/RelatedResources/RelatedResources';
import { addPlusSignToCount } from '@data-exploration-app/utils/stringUtils';
import { useNavigateWithHistory } from '@data-exploration-app/hooks/hooks';
import { useLocation } from 'react-router-dom';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem & { title: string };
  tab: string;
  additionalTabs?: React.ReactElement<TabsProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
  style?: React.CSSProperties;
};

const defaultRelationshipTabs: ResourceType[] = [
  'asset',
  'timeSeries',
  'file',
  'event',
  'sequence',
];

const ResourceDetailTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem & { title: string };
  type: ResourceType;
}) => {
  const navigateWithHistory = useNavigateWithHistory(resource);
  const location = useLocation();

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      (el) =>
        // eslint-disable-next-line lodash/prefer-matches
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  const search = getSearchParams(location.search);

  return (
    <RelatedResources
      type={type}
      parentResource={resource}
      onItemClicked={(id: number) => {
        navigateWithHistory(createLink(`/explore/${type}/${id}`, search));
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
    (type) => !excludedTypes.includes(type)
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

  const relationshipTabs = filteredTabs.map((key) => (
    <Tabs.Tab
      tabKey={key}
      label={getTitle(key)}
      chipRight={{
        label: addPlusSignToCount(
          key === 'asset' ? assetCount : counts[key]!,
          hasMoreRelationships[key]!
        ),
        size: 'x-small',
      }}
    >
      <ResourceDetailTabContent
        resource={parentResource}
        type={key as ResourceType}
      />
    </Tabs.Tab>
  ));
  const tabs = [...additionalTabs, ...relationshipTabs];

  return (
    <StyledTabs style={style} onTabClick={onTabChange}>
      {tabs}
    </StyledTabs>
  );
};

const StyledTabs = styled(Tabs)`
  flex: 1;
  height: 100%;

  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
  }
  .rc-tabs-content-holder {
    display: flex;
    /* We need to consider the height of the tab switcher part at the top which is 48px in height */
    height: calc(100% - 48px);
    overflow: auto;
  }
`;

export const TabTitle = styled.span``;
