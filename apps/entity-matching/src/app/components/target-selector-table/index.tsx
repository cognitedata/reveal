import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { TARGET_TABLE_QUERY_KEY } from '../../common/constants';
import { useQuickMatchContext } from '../../context/QuickMatchContext';
import { RawTarget } from '../../types/api';
import { getAdvancedFilter } from '../../utils';
import { DataSetSelect } from '../data-set-select';
import QuickMatchActionBar from '../qm-action-bar/QuickMatchActionbar';
import ResourceCount from '../resource-count';
import RootAssetSelect from '../root-asset-select';
import SearchInput from '../search-input';
import AssetTable from '../source-selector-table/AssetTable';

export default function TargetSelectionTable() {
  const {
    targetsList,
    setTargetsList,
    targetFilter,
    setTargetFilter,
    allTargets,
    setAllTargets,
  } = useQuickMatchContext();
  const { t } = useTranslation();
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const query = searchParams.get(TARGET_TABLE_QUERY_KEY);
  const advancedFilter = useMemo(
    () => getAdvancedFilter({ api: 'assets', query }),
    [query]
  );

  const onClose = () => setTargetsList([]);

  const handleSelectRow = (row: RawTarget, checked: boolean) => {
    if (checked) {
      setTargetsList((prevState) => prevState.concat([row]));
    } else {
      setTargetsList((prevState) =>
        prevState.filter(({ id: testId }) => row.id !== testId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setAllTargets(true);
      setTargetsList([]);
    } else {
      setAllTargets(false);
    }
  };

  return (
    <Container $isActionBarVisible={!!targetsList.length}>
      <Flex direction="column">
        <Flex justifyContent="space-between">
          <Flex gap={12} alignItems="center">
            <DataSetSelect
              api="assets"
              onChange={(id?: number) => {
                setTargetFilter({
                  ...targetFilter,
                  dataSetIds: id ? [{ id }] : undefined,
                });
              }}
              selected={targetFilter.dataSetIds?.[0]?.id}
              dataTestId="data-set-select"
            />
            <RootAssetSelect
              onChange={(id) => {
                setTargetFilter({
                  ...targetFilter,
                  assetSubtreeIds: id ? [{ id }] : undefined,
                });
              }}
            />
            <SearchInput
              disabled={allTargets}
              value={query || ''}
              placeholder={t('filter-by-name-placeholder')}
              onChange={(e) => {
                searchParams.set(TARGET_TABLE_QUERY_KEY, e.target.value);
                setSearchParams(searchParams);
              }}
              icon="Search"
            />
          </Flex>
          <Flex alignItems="center" gap={12}>
            <ResourceCount
              type="assets"
              filter={targetFilter}
              advancedFilter={advancedFilter}
            />
          </Flex>
        </Flex>
        <AssetTable
          filter={targetFilter}
          selected={targetsList}
          advancedFilter={advancedFilter}
          allSources={allTargets}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          query={query}
        />
      </Flex>
      <QuickMatchActionBar
        selectedRows={targetsList}
        sourceType="assets"
        onClose={onClose}
      />
    </Container>
  );
}

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
