import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { DataSetSelect } from '@entity-matching-app/components/data-set-select';

import { useTranslation } from '@entity-matching-app/common';

import QuickMatchActionBar from '@entity-matching-app/components/qm-action-bar/QuickMatchActionbar';

import { TARGET_TABLE_QUERY_KEY } from '@entity-matching-app/common/constants';

import ResourceCount from '@entity-matching-app/components/resource-count';

import { Flex } from '@cognite/cogs.js';

import RootAssetSelect from '@entity-matching-app/components/root-asset-select';
import SearchInput from '@entity-matching-app/components/search-input';
import AssetTable from '@entity-matching-app/components/source-selector-table/AssetTable';
import { useQuickMatchContext } from '@entity-matching-app/context/QuickMatchContext';
import { RawTarget } from '@entity-matching-app/types/api';
import { getAdvancedFilter } from '@entity-matching-app/utils';

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
