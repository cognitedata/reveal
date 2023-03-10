import { Checkbox, Flex } from '@cognite/cogs.js';
import { useSearchParams } from 'react-router-dom';
import { TARGET_TABLE_QUERY_KEY } from 'common/constants';
import AssetTable from 'components/source-selector-table/AssetTable';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import { getAdvancedFilter } from 'utils';
import { useMemo } from 'react';
import ResourceCount from 'components/resource-count';
import { DataSetSelect } from 'components/data-set-select';
import SearchInput from 'components/search-input';

type Props = {};

export default function TargetSelectionTable({}: Props) {
  const {
    targetsList,
    setTargetsList,
    targetFilter,
    setTargetFilter,
    allTargets,
    setAllTargets,
  } = useQuickMatchContext();

  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const query = searchParams.get(TARGET_TABLE_QUERY_KEY);
  const advancedFilter = useMemo(
    () => getAdvancedFilter({ api: 'assets', query }),
    [query]
  );

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Flex gap={12}>
          <DataSetSelect
            api="assets"
            onChange={(e: number[]) => {
              setTargetFilter({
                ...targetFilter,
                dataSetIds:
                  e.length > 0
                    ? e.map((id) => ({
                        id,
                      }))
                    : undefined,
              });
            }}
            selected={targetFilter.dataSetIds?.map((ds) => ds.id) || []}
          />
          <SearchInput
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
