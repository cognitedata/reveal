import {
  Flex,
  Icon,
  Body,
  IconType,
  InputExp,
  Switch,
  Checkbox,
} from '@cognite/cogs.js';
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
import ThreeDTable from './Three3Table';
import styled from 'styled-components';
import QuickMatchActionBar from 'components/qm-action-bar/QuickMatchActionbar';

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
    setModelFieldMapping,
  } = useQuickMatchContext();

  const sourceTypeOptions: {
    value: SourceType;
    label: string;
    icon: IconType;
  }[] = [
    { value: 'timeseries', label: t('resource-type-ts'), icon: 'Timeseries' },
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
      label: t('resource-type-3d-model', { count: 0 }),
      icon: 'Cube',
    },
  ];
  const [searchParams, _setSearchParams] = useSearchParams();
  const setSearchParams = _setSearchParams;

  const handleSelectSourceType = (selectedSourceType: string) => {
    if (SOURCE_TYPES.some((type) => type === selectedSourceType)) {
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

  return (
    <Container $isActionBarVisible={!!sourcesList.length}>
      <Flex direction="column">
        <Flex justifyContent="space-between">
          <Flex direction="row" gap={12} alignItems="center">
            <Select
              style={{ width: 220 }}
              defaultValue="timeseries"
              onChange={handleSelectSourceType}
            >
              {sourceTypeOptions.map(({ value, label, icon }) => (
                <Option key={value} value={value}>
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
