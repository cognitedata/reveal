import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { getTabCountLabel } from '@data-exploration-components/utils';

import { createLink } from '@cognite/cdf-utilities';
import { Tabs, TabProps } from '@cognite/cogs.js';
import {
  useRelatedResourceCounts,
  ResourceType,
  ResourceItem,
  getTitle,
} from '@cognite/data-exploration';

import { RelatedResources } from '@data-exploration-app/containers/ResourceDetails/RelatedResources/RelatedResources';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { useNavigateWithHistory } from '@data-exploration-app/hooks/hooks';
import { addPlusSignToCount } from '@data-exploration-app/utils/stringUtils';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';
import {
  formatNumber,
  getTranslationEntry,
  useTranslation,
  withThousandSeparator,
} from '@data-exploration-lib/core';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem & { title: string };
  tab: string;
  additionalTabs?: React.ReactElement<TabProps>[];
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

  // TODO: is this used?
  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      (el) =>
        // eslint-disable-next-line lodash/prefer-matches
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  const search = getSearchParams(location.search);

  const handleParentAssetClicked = (assetId: number) => {
    navigateWithHistory(createLink(`/explore/asset/${assetId}`, search));
  };

  return (
    <RelatedResources
      type={type}
      parentResource={resource}
      onItemClicked={(id: number) => {
        navigateWithHistory(createLink(`/explore/${type}/${id}`, search));
      }}
      onParentAssetClick={handleParentAssetClicked}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};

// TODO: We have a new version `ResourceDetailsTabsV2`, can remove this file after new navigation adoption.
export const ResourceDetailsTabs = ({
  parentResource,
  tab,
  additionalTabs = [],
  excludedTypes = [],
  onTabChange,
  style = {},
}: ResouceDetailsTabsProps) => {
  const { t } = useTranslation();
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const { counts, hasMoreRelationships } = useRelatedResourceCounts(
    parentResource,
    isAdvancedFiltersEnabled
  );

  const filteredTabs = defaultRelationshipTabs.filter(
    (type) => !excludedTypes.includes(type)
  );

  const getCountLabel = (count: number, key: ResourceType) => {
    return isAdvancedFiltersEnabled
      ? getTabCountLabel(count)
      : addPlusSignToCount(formatNumber(count), hasMoreRelationships[key]!);
  };

  const relationshipTabs = filteredTabs.map((key) => {
    const totalCount = counts[key] || 0;
    const titleTranslationKey = `${key}_${getTranslationEntry(totalCount)}`;

    const title = getTitle(key, totalCount !== 1);
    const titleTranslated = t(titleTranslationKey, title, {
      count: totalCount,
    });

    return (
      <Tabs.Tab
        tabKey={key}
        key={key}
        label={titleTranslated}
        chipRight={{
          label: getCountLabel(counts[key] || 0, key),
          size: 'x-small',
          tooltipProps: { content: withThousandSeparator(counts[key], ',') },
        }}
      >
        <ResourceDetailTabContent
          resource={parentResource}
          type={key as ResourceType}
        />
      </Tabs.Tab>
    );
  });
  const tabs = [...additionalTabs, ...relationshipTabs];

  return (
    <DetailsTabWrapper>
      <StyledTabs
        showTrack
        activeKey={tab}
        style={style}
        onTabClick={onTabChange}
      >
        {tabs}
      </StyledTabs>
    </DetailsTabWrapper>
  );
};

const DetailsTabWrapper = styled.div`
  /* This workaround is need to fix the file preview in file details tab */
  height: 100%;
  overflow: hidden;
  & > div {
    height: 100%;
  }
`;

const StyledTabs = styled(Tabs)`
  flex: 1;
  height: 100%;
`;

export const TabTitle = styled.span``;
