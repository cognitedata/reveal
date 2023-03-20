import { Checkbox, Flex, Overline } from '@cognite/cogs.js';
import { Select } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { SOURCE_TABLE_QUERY_KEY } from 'common/constants';
import { useQuickMatchContext } from 'context/QuickMatchContext';
import ResourceCount from 'components/resource-count';
import { useMemo } from 'react';
import TimeseriesTable from './TimeseriesTable';
import EventTable from './EventTable';
import SequenceTable from './SequenceTable';
import { getAdvancedFilter } from 'utils';
import { API, SourceType, SOURCE_TYPES } from 'types/api';
import FileInfoTable from './FilesTable';
import { DataSetSelect } from 'components/data-set-select';
import SearchInput from 'components/search-input';
import ThreeDTable from './Three3Table';

const { Option } = Select;

type Props = {};
const supportsAdvancedFilter: Record<API, boolean> = {
  files: false,
  timeseries: true,
  assets: true,
  events: true,
  sequences: true,
  threeD: false,
};

const supportsBasicFilter: Record<API, boolean> = {
  files: true,
  timeseries: true,
  assets: true,
  events: true,
  sequences: true,
  threeD: false,
};

export default function SourceSelectionTable({}: Props) {
  const { t } = useTranslation();
  const {
    setSourceType,
    sourceType,
    setSourcesList,
    sourcesList,
    unmatchedOnly,
    setUnmatchedOnly,
    sourceFilter,
    setSourceFilter,
    allSources,
    setAllSources,
  } = useQuickMatchContext();
  const sourceTypeOptions: { value: SourceType; label: string }[] = [
    { value: 'timeseries', label: t('resource-type-ts') },
    { value: 'events', label: t('resource-type-events', { count: 0 }) },
    { value: 'files', label: t('resource-type-files', { count: 0 }) },
    { value: 'sequences', label: t('resource-type-sequences', { count: 0 }) },
    { value: 'threeD', label: t('resource-type-3d-model', { count: 0 }) },
  ];
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const handleSelectSourceType = (selectedSourceType: string) => {
    if (SOURCE_TYPES.some((type) => type === selectedSourceType)) {
      setSourceType(selectedSourceType as SourceType);
    }
  };

  const query = searchParams.get(SOURCE_TABLE_QUERY_KEY);

  const advancedFilter = useMemo(
    () =>
      getAdvancedFilter({
        api: sourceType,
        excludeMatched: unmatchedOnly,
        query,
      }),
    [unmatchedOnly, sourceType, query]
  );

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Flex direction="row" gap={12} alignItems="center">
          <Overline>{t('resource-type')}</Overline>
          <Select
            style={{ width: 220 }}
            defaultValue="timeseries"
            onChange={handleSelectSourceType}
          >
            {sourceTypeOptions.map(({ value, label }) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
          {supportsBasicFilter[sourceType] && (
            <>
              <Overline>{t('filter', { count: 0 })}</Overline>
              <DataSetSelect
                api={sourceType}
                onChange={(id?: number) => {
                  setSourceFilter({
                    ...sourceFilter,
                    dataSetIds:
                      id && Number.isFinite(id) ? [{ id }] : undefined,
                  });
                }}
                selected={sourceFilter.dataSetIds?.[0]?.id}
              />
              <SearchInput
                disabled={allSources}
                value={query || ''}
                placeholder={t('search-placeholder')}
                onChange={(e) => {
                  searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
                  setSearchParams(searchParams);
                }}
              />
            </>
          )}
          {supportsAdvancedFilter[sourceType] && (
            <Checkbox
              onChange={(e) => setUnmatchedOnly(e.target.checked)}
              checked={unmatchedOnly}
              label={t('filter-only-unmatched-items')}
            />
          )}
        </Flex>
        {supportsBasicFilter[sourceType] && (
          <Flex alignItems="center" gap={12}>
            {sourceType !== 'threeD' && (
              <ResourceCount
                type={sourceType}
                filter={sourceFilter}
                advancedFilter={advancedFilter}
              />
            )}

            <Checkbox
              checked={!query && allSources}
              disabled={!!query}
              onChange={(e) => setAllSources(e.target.checked)}
              label="Select all"
            />
          </Flex>
        )}
      </Flex>

      {sourceType === 'timeseries' && (
        <TimeseriesTable
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
          allSources={allSources}
        />
      )}
      {sourceType === 'events' && (
        <EventTable
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
          allSources={allSources}
        />
      )}
      {sourceType === 'files' && (
        <FileInfoTable
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
          allSources={allSources}
          query={query}
        />
      )}
      {sourceType === 'sequences' && (
        <SequenceTable
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
          allSources={allSources}
        />
      )}
      {sourceType === 'threeD' && <ThreeDTable />}
    </Flex>
  );
}
