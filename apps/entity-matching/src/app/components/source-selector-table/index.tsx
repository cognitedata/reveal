import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { Select } from 'antd';

import { Flex, Icon, Body, IconType, InputExp, Switch } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { SOURCE_TABLE_QUERY_KEY } from '../../common/constants';
import { useQuickMatchContext } from '../../context/QuickMatchContext';
import { API, RawSource, SOURCE_TYPES, SourceType } from '../../types/api';
import { getAdvancedFilter } from '../../utils';
import { DataSetSelect } from '../data-set-select';
import QuickMatchActionBar from '../qm-action-bar/QuickMatchActionbar';
import ResourceCount from '../resource-count';

import EventTable from './EventTable';
import FileInfoTable from './FilesTable';
import SequenceTable from './SequenceTable';
import ThreeDTable from './Three3Table';
import TimeseriesTable from './TimeseriesTable';

const { Option } = Select;

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

export default function SourceSelectionTable() {
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
    setModelFieldMapping,
  } = useQuickMatchContext();

  const sourceTypeOptions: {
    value: SourceType;
    label: string;
    icon: IconType;
  }[] = [
    {
      value: 'timeseries',
      label: t('resource-type-timeseries'),
      icon: 'Timeseries',
    },
    {
      value: 'events',
      label: t('resource-type-events', { count: 0 }),
      icon: 'Events',
    },
    {
      value: 'files',
      label: t('resource-type-files', { count: 0 }),
      icon: 'Document',
    },
    {
      value: 'sequences',
      label: t('resource-type-sequences', { count: 0 }),
      icon: 'Sequences',
    },
    {
      value: 'threeD',
      label: t('resource-type-threeD', { count: 0 }),
      icon: 'Cube',
    },
  ];
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const handleSelectSourceType = (selectedSourceType: string) => {
    if (SOURCE_TYPES.some((type: any) => type === selectedSourceType)) {
      setSourceType(selectedSourceType as SourceType);
    }
    if (selectedSourceType === 'events') {
      setModelFieldMapping([{ source: 'externalId', target: 'name' }]);
    } else {
      setModelFieldMapping([{ source: 'name', target: 'name' }]);
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

  const onClose = () => setSourcesList([]);

  const handleSelectRow = (row: RawSource, checked: boolean) => {
    if (checked) {
      setSourcesList((prevState: any) => prevState.concat([row]));
    } else {
      setSourcesList((prevState: any) =>
        prevState.filter(({ id: testId }: any) => row.id !== testId)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setAllSources(true);
      setSourcesList([]);
    } else {
      setAllSources(false);
    }
  };

  return (
    <Container $isActionBarVisible={!!sourcesList.length}>
      <Flex direction="column">
        <Flex justifyContent="space-between">
          <Flex direction="row" gap={12} alignItems="center">
            <Select
              style={{ width: 220 }}
              defaultValue="timeseries"
              onChange={handleSelectSourceType}
              data-testid="data-type"
            >
              {sourceTypeOptions.map(({ value, label, icon }) => (
                <Option
                  key={value}
                  value={value}
                  data-testid="data-type-option"
                >
                  <SourceOptionContainer>
                    <Icon type={icon} />
                    <Body level={2}>{label}</Body>
                  </SourceOptionContainer>
                </Option>
              ))}
            </Select>
            {supportsBasicFilter[sourceType] && (
              <>
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
                  dataTestId="data-set-select"
                />
                <InputExp
                  disabled={allSources}
                  value={query || ''}
                  placeholder={t('filter-by-name-placeholder')}
                  onChange={(e) => {
                    searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
                    setSearchParams(searchParams);
                  }}
                />
              </>
            )}
            {supportsAdvancedFilter[sourceType] && (
              <Switch
                onChange={() =>
                  // eslint-disable-next-line
                  setUnmatchedOnly((unmatchedOnly) => !unmatchedOnly)
                }
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
            </Flex>
          )}
        </Flex>

        {sourceType === 'timeseries' && (
          <TimeseriesTable
            filter={sourceFilter}
            selected={sourcesList}
            advancedFilter={advancedFilter}
            allSources={allSources}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            query={query}
          />
        )}
        {sourceType === 'events' && (
          <EventTable
            filter={sourceFilter}
            selected={sourcesList}
            advancedFilter={advancedFilter}
            allSources={allSources}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            query={query}
          />
        )}
        {sourceType === 'files' && (
          <FileInfoTable
            filter={sourceFilter}
            selected={sourcesList}
            advancedFilter={advancedFilter}
            allSources={allSources}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            query={query}
          />
        )}
        {sourceType === 'sequences' && (
          <SequenceTable
            filter={sourceFilter}
            selected={sourcesList}
            advancedFilter={advancedFilter}
            allSources={allSources}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            query={query}
          />
        )}
        {sourceType === 'threeD' && <ThreeDTable />}
      </Flex>
      <QuickMatchActionBar
        selectedRows={sourcesList}
        sourceType={sourceType}
        onClose={onClose}
      />
    </Container>
  );
}

const SourceOptionContainer = styled(Flex).attrs({
  alignItems: 'center',
  gap: 8,
})`
  height: 100%;
`;

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
