import React from 'react';

import styled from 'styled-components';

import { getChipRightPropsForResourceCounter } from '@data-exploration/containers';

import { Tabs, TabProps, ChipProps } from '@cognite/cogs.js';
import {
  ResourceType,
  ResourceItem,
  useRelatedResourceCounts,
  getTabCountLabel,
} from '@cognite/data-exploration';

import {
  formatNumber,
  getTitle,
  getTranslationEntry,
  useTranslation,
  withThousandSeparator,
} from '@data-exploration-lib/core';
import { useTotalRelatedResourcesCounts } from '@data-exploration-lib/domain-layer';

import {
  useFlagDocumentsApiEnabled,
  useFlagNewCounts,
  usePushJourney,
} from '../../../hooks';
import { addPlusSignToCount } from '../../../utils/stringUtils';
import { RelatedResources } from '../RelatedResourcesV2';

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
  const [pushJourney] = usePushJourney();

  return (
    <RelatedResources
      resource={resource}
      relatedResourcesType={type}
      onItemClicked={(id) => {
        pushJourney({ id, type, initialTab: type });
      }}
      onParentAssetClick={(id) => {
        pushJourney({ id, type: 'asset' });
      }}
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
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const isNewCountsEnabled = useFlagNewCounts();

  const {
    counts: oldCounts,
    hasMoreRelationships,
    isLoading: isOldCountsLoading,
  } = useRelatedResourceCounts(parentResource, isDocumentsApiEnabled);

  const { data: newCounts, isLoading: isNewCountsLoading } =
    useTotalRelatedResourcesCounts({
      resource: parentResource,
      isDocumentsApiEnabled,
    });

  const { t } = useTranslation();

  const counts = isNewCountsEnabled ? newCounts : oldCounts;
  const isLoading = isNewCountsEnabled
    ? isNewCountsLoading
    : isOldCountsLoading;

  const getChipRightProps = (
    count: number,
    key: ResourceType
  ): { chipRight?: ChipProps } => {
    if (isNewCountsEnabled) {
      return getChipRightPropsForResourceCounter(
        count,
        isLoading[key] || false
      );
    }

    return {
      chipRight: {
        label: isDocumentsApiEnabled
          ? getTabCountLabel(count)
          : addPlusSignToCount(formatNumber(count), hasMoreRelationships[key]!),
        size: 'x-small',
        tooltipProps: { content: withThousandSeparator(count, ',') },
      },
    };
  };

  const filteredTabs = defaultRelationshipTabs.filter(
    (type) => !excludedTypes.includes(type)
  );

  const relationshipTabs = filteredTabs.map((key) => {
    const count = counts[key] || 0;
    const isCountLoading = isLoading[key] || false;
    const titleTranslationKey = `${key.toUpperCase()}_${getTranslationEntry(
      count
    )}`;

    const title = getTitle(key, isCountLoading || count !== 1);
    const titleTranslated = t(titleTranslationKey, title, { count });

    return (
      <Tabs.Tab
        {...getChipRightProps(count, key)}
        tabKey={key}
        key={key}
        label={titleTranslated}
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
