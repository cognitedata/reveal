import styled from 'styled-components';

import { Skeleton, Tabs } from '@cognite/cogs.js';

import { formatBigNumbersWithSuffix } from '../../../app/utils/number';
import { useSearchCategoryParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useFDM } from '../../providers/FDMProvider';

import { useSearchDataTypeSortedByKeys } from './hooks/useSearchDataTypeSortedByKeys';
import { useSearchThreeDMappedSortedByKeys } from './hooks/useSearchThreeDMappedSortedByKeys';
import { useSearchThreeDMappedTotalCount } from './hooks/useSearchThreeDMappedTotalCount';
import { useSearchTotalCount } from './hooks/useSearchTotalCount';

interface Props {
  displayOnlyMapped3dData?: boolean;
}

export const ThreeDSearchCategories: React.FC<Props> = ({
  displayOnlyMapped3dData,
}) => {
  const { t } = useTranslation();
  const [searchCategory, setSearchCategory] = useSearchCategoryParams();
  const client = useFDM();

  const {
    counts: counts3d,
    keys: keys3d,
    isLoading: isCounts3dLoading,
  } = useSearchThreeDMappedSortedByKeys(displayOnlyMapped3dData);
  const { totalCount: totalCount3d, isLoading: isTotalCount3dLoading } =
    useSearchThreeDMappedTotalCount(displayOnlyMapped3dData);

  const {
    counts,
    keys,
    isLoading: isCountsLoading,
  } = useSearchDataTypeSortedByKeys();
  const { totalCount, isLoading: isTotalCountLoading } = useSearchTotalCount();

  const transformedTotalCount = displayOnlyMapped3dData
    ? totalCount3d
    : totalCount;
  const transformedCounts = displayOnlyMapped3dData ? counts3d : counts;
  const transformedKeys = displayOnlyMapped3dData ? keys3d : keys;

  const isDataLoading = displayOnlyMapped3dData
    ? isCounts3dLoading || isTotalCount3dLoading
    : isCountsLoading || isTotalCountLoading;

  if (isDataLoading) {
    return (
      <SkeletonWrapper>
        <Skeleton.List lines={1} />
      </SkeletonWrapper>
    );
  }

  const isSelected = (name: string) =>
    searchCategory === name || (!searchCategory && name === 'all');

  const handleSelectionClick = (name?: string) => {
    setSearchCategory(name);
  };

  const renderTabItem = (
    key: string,
    index: number,
    label: string,
    count: number | undefined
  ) => {
    return (
      <Tabs.Tab
        key={`${key}-${index}`}
        tabKey={key}
        label={label}
        style={{
          background: isSelected(key)
            ? 'rgba(74, 103, 251, 0.08)'
            : 'rgba(83, 88, 127, 0.08)',
          marginRight: 8,
          borderRadius: 6,
          boxShadow: 'none',
        }}
        disabled={!count}
        chipRight={{
          size: 'x-small',
          type: isSelected(key) ? 'neutral' : undefined,
          label: formatBigNumbersWithSuffix(count) ?? '?',
        }}
      />
    );
  };

  return (
    <TabsWrapper>
      <Tabs
        onTabClick={(key) => {
          if (key === 'all') {
            handleSelectionClick(undefined);
            return;
          }

          handleSelectionClick(key);
        }}
        size="medium"
        activeKey={searchCategory ?? 'all'}
      >
        {[
          renderTabItem(
            'all',
            0,
            t('SEARCH_CATEGORIES_ALL_OPTION'),
            transformedTotalCount
          ),
          ...transformedKeys.map((key, index) => {
            const count = transformedCounts?.[key];

            if (key === 'TimeSeries') {
              return renderTabItem(key, index, 'Time Series', count);
            }

            const type = client.getTypesByDataType(key);
            const tabLabel = type?.displayName ?? type?.name ?? key;

            return renderTabItem(key, index, tabLabel, count);
          }),
        ]}
      </Tabs>
    </TabsWrapper>
  );
};

const SkeletonWrapper = styled.div`
  width: 100%;
  padding-top: 0;

  .list-item {
    height: 36px;
  }
`;

const TabsWrapper = styled.div`
  min-width: 0;

  .cogs-button--type-ghost {
    background: rgba(83, 88, 127, 0.08);
  }

  .cogs-tabs__tabbar {
    gap: 8px;
  }
`;
