import { Checkbox, Flex } from '@cognite/cogs.js';
import { Select, Input } from 'antd';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { SOURCE_TABLE_QUERY_KEY } from 'common/constants';
import {
  SourceType,
  SOURCE_TYPES,
  useQuickMatchContext,
} from 'context/QuickMatchContext';
import { useAllDataSets } from 'hooks/datasets';
import ResourceCount from 'components/resource-count';
import { useMemo } from 'react';
import TimeseriesTable from './TimeseriesTable';
import EventTable from './EventTable';
import { getUnmatchedFilter } from 'utils';

const { Option } = Select;

type OptionType = {
  value: number;
  label: string;
};

type Props = {};

export default function ResourceSelectionTable({}: Props) {
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
    { value: 'events', label: t('resource-type-events') },
  ];
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;
  const { data: datasets, isInitialLoading } = useAllDataSets<OptionType[]>({
    select(items) {
      return items.map((ds) => ({
        label: ds.name || ds.id.toString(),
        value: ds.id,
      }));
    },
  });

  const handleSelectResourceType = (selectedResourceType: string) => {
    if (SOURCE_TYPES.some((type) => type === selectedResourceType)) {
      setSourceType(selectedResourceType as SourceType);
    }
  };

  const advancedFilter = useMemo(
    () => (unmatchedOnly ? getUnmatchedFilter(sourceType) : undefined),
    [unmatchedOnly, sourceType]
  );

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Flex direction="row" gap={12}>
          <Select
            style={{ width: 120 }}
            defaultValue="timeseries"
            onChange={handleSelectResourceType}
          >
            {sourceTypeOptions.map(({ value, label }) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            allowClear
            placeholder={t('resource-type-datasets')}
            style={{ width: 120 }}
            loading={isInitialLoading}
            optionFilterProp="label"
            options={datasets}
            value={datasets
              ?.filter(({ value }) =>
                sourceFilter.dataSetIds.find(({ id }) => id === value)
              )
              .map((ds) => ds.value)}
            onChange={(e: number[]) => {
              setSourceFilter({
                ...sourceFilter,
                dataSetIds: e.map((id) => ({
                  id,
                })),
              });
            }}
          />
          <Input.Search
            style={{ width: 120 }}
            value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
            onChange={(e) => {
              searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
              setSearchParams(searchParams);
            }}
          />
          <Checkbox
            onChange={(e) => setUnmatchedOnly(e.target.checked)}
            checked={unmatchedOnly}
            label={t('filter-only-unmatched-items')}
          />
        </Flex>
        <Flex alignItems="center" gap={12}>
          <ResourceCount
            type={sourceType}
            filter={sourceFilter}
            advancedFilter={advancedFilter}
          />
          <Checkbox
            checked={allSources}
            onChange={(e) => setAllSources(e.target.checked)}
            label="Select all"
          />
        </Flex>
      </Flex>

      {sourceType === 'timeseries' && (
        <TimeseriesTable
          query={searchParams.get(SOURCE_TABLE_QUERY_KEY)}
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
          allSources={allSources}
        />
      )}
      {sourceType === 'events' && (
        <EventTable
          query={searchParams.get(SOURCE_TABLE_QUERY_KEY)}
          filter={sourceFilter}
          selected={sourcesList}
          setSelected={setSourcesList}
          advancedFilter={advancedFilter}
        />
      )}
    </Flex>
  );
}
