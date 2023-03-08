import { Checkbox, Flex } from '@cognite/cogs.js';
import { Select, Input } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { TARGET_TABLE_QUERY_KEY } from 'common/constants';
import AssetTable from 'components/resource-selector-table/AssetTable';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { useAllDataSets } from 'hooks/datasets';
import { getAdvancedFilter } from 'utils';
import { useMemo } from 'react';
import ResourceCount from 'components/resource-count';

type Props = {};

export default function TargetSelectionTable({}: Props) {
  const { t } = useTranslation();
  const {
    targetsList,
    setTargetsList,
    targetFilter,
    setTargetFilter,
    unmatchedOnly,
    allTargets,
    setAllTargets,
  } = useQuickMatchContext();

  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;
  const { data: datasets, isInitialLoading } = useAllDataSets({
    select(items) {
      return items.map(({ id, name }) => ({
        value: id,
        label: name || id.toString(),
      }));
    },
  });

  const query = searchParams.get(TARGET_TABLE_QUERY_KEY);
  const advancedFilter = useMemo(
    () =>
      getAdvancedFilter({
        api: 'assets',
        excludeMatched: unmatchedOnly,
        query,
      }),
    [unmatchedOnly, query]
  );

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Flex gap={12}>
          <Select
            mode="multiple"
            allowClear
            placeholder={t('resource-type-datasets', {
              count: 0,
            })}
            style={{ width: 120 }}
            loading={isInitialLoading}
            optionFilterProp="label"
            options={datasets}
            value={datasets
              ?.filter(({ value }) =>
                targetFilter.dataSetIds.find(({ id }) => id === value)
              )
              .map((ds) => ds.value)}
            onChange={(e: number[]) => {
              setTargetFilter({
                ...targetFilter,
                dataSetIds: e.map((id) => ({
                  id,
                })),
              });
            }}
          />
          <Input.Search
            style={{ width: 120 }}
            disabled={allTargets}
            value={query || ''}
            onChange={(e) => {
              searchParams.set(TARGET_TABLE_QUERY_KEY, e.target.value);
              setSearchParams(searchParams);
            }}
          />
        </Flex>
        <Flex alignItems="center" gap={12}>
          <ResourceCount
            type="assets"
            filter={targetFilter}
            advancedFilter={advancedFilter}
          />
          <Checkbox
            checked={!query && allTargets}
            disabled={!!query}
            onChange={(e) => setAllTargets(e.target.checked)}
            label="Select all"
          />
        </Flex>
      </Flex>
      <AssetTable
        filter={targetFilter}
        selected={targetsList}
        setSelected={setTargetsList}
        advancedFilter={advancedFilter}
        allSources={allTargets}
      />
    </Flex>
  );
}
