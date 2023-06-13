/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import styled from 'styled-components';

import isArray from 'lodash/isArray';

import { Body, Flex, Icon, Chip, Tooltip, Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import DataSetName from '../../components/data-sets-list/data-set-name';
import ExtractionPipelineName from '../../components/data-sets-list/extraction-pipeline-name';
import GovernanceStatus from '../../components/data-sets-list/governance-status';
import { useResourceAggregates } from '../../hooks/useResourceAggregates';

// @ts-ignore
import { getItemFromStorage } from '../../utils/localStorage';
import { stringCompare } from '../../utils/shared';
import {
  CogsTableCellRenderer,
  DataSet,
  DataSetV3,
  Extpipe,
} from '../../utils/types';

export type DataSetRow = {
  key: number;
  id: DataSetV3['id'];
  externalId: DataSetV3['externalId'];
  name: string;
  labels: string[];
  quality?: boolean;
  description: string;
  extpipes: Extpipe[];
  writeProtected: boolean;
  archived: boolean;
};

const ResourceCountColumn = ({ dataSetId }: { dataSetId: number }) => {
  const { t } = useTranslation();
  const [
    { data: assets },
    { data: timeseries },
    { data: files },
    { data: events },
    { data: sequences },
  ] = useResourceAggregates(dataSetId);

  const assetCount = assets?.[0]?.count || 0;
  const timeseriesCount = timeseries?.[0]?.count || 0;
  const filesCount = files?.[0]?.count || 0;
  const eventsCount = events?.[0]?.count || 0;
  const sequencesCount = sequences?.[0]?.count || 0;

  return (
    <Flex gap={8}>
      {assetCount > 0 && (
        <Tooltip
          content={`${assetCount.toLocaleString()} ${t('assets', {
            postProcess: 'lowercase',
          })}`}
        >
          <Body level={2} strong>
            <StyledLabelCount
              size="small"
              icon="Assets"
              type="default"
              hideTooltip
              label={assetCount.toLocaleString()}
            />
          </Body>
        </Tooltip>
      )}
      {timeseriesCount > 0 && (
        <Tooltip
          content={`${timeseriesCount.toLocaleString()} ${t('time-series', {
            postProcess: 'lowercase',
          })}`}
        >
          <Body level={2} strong>
            <StyledLabelCount
              size="small"
              icon="Timeseries"
              type="default"
              label={timeseriesCount.toLocaleString()}
            />
          </Body>
        </Tooltip>
      )}
      {filesCount > 0 && (
        <Tooltip
          content={`${filesCount.toLocaleString()} ${t('files', {
            postProcess: 'lowercase',
          })}`}
        >
          <Body level={2} strong>
            <StyledLabelCount
              size="small"
              icon="Document"
              type="default"
              label={filesCount.toLocaleString()}
            />
          </Body>
        </Tooltip>
      )}
      {eventsCount > 0 && (
        <Tooltip
          content={`${eventsCount.toLocaleString()} ${t('events', {
            postProcess: 'lowercase',
          })}`}
        >
          <Body level={2} strong>
            <StyledLabelCount
              size="small"
              icon="Events"
              type="default"
              label={eventsCount.toLocaleString()}
            />
          </Body>
        </Tooltip>
      )}
      {sequencesCount > 0 && (
        <Tooltip
          content={`${sequencesCount.toLocaleString()} ${t('sequence_other', {
            postProcess: 'lowercase',
          })}`}
        >
          <Body level={2} strong>
            <StyledLabelCount
              size="small"
              icon="Sequences"
              type="default"
              label={sequencesCount.toLocaleString()}
            />
          </Body>
        </Tooltip>
      )}
      {assetCount === 0 &&
        timeseriesCount === 0 &&
        filesCount === 0 &&
        eventsCount === 0 &&
        sequencesCount === 0 && (
          <StyledEmptyText level={3}>{t('dataset-is-empty')}</StyledEmptyText>
        )}
    </Flex>
  );
};

const StyledEmptyText = styled(Body)`
  color: rgba(0, 0, 0, 0.55);
`;
const StyledLabelCount = styled(Chip).attrs({ hideTooltip: true })`
  background: ${Colors['surface--muted']} !important;
  border: 1px solid #bfbfbf;
  border-radius: 4px;
`;

export const getLabelsList = (dataSets: DataSet[], showArchived: boolean) => {
  const labels: string[] = [];
  let dataSetsList = dataSets;
  if (!showArchived) {
    dataSetsList = dataSets.filter((set) => set.metadata.archived !== true);
  }
  dataSetsList.forEach((dataSet) => {
    if (isArray(dataSet.metadata.consoleLabels))
      dataSet.metadata.consoleLabels.forEach((label: string) => {
        if (!labels.includes(label)) {
          labels.push(label);
        }
      });
  });

  return labels.sort();
};

export const useTableColumns = () => {
  const { t } = useTranslation();

  const getTableColumns = (
    dataSets: DataSet[],
    showArchived: boolean,
    isExtpipeFlag: boolean,
    isExtpipesFetched?: boolean
  ) => [
    {
      Header: t('name'),
      dataIndex: 'name',
      id: 'dataset-name-column',
      accessor: 'name',
      sorter: (a: DataSetRow, b: DataSetRow) => stringCompare(a.name, b.name),
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<DataSetRow>) => (
        <DataSetName
          id={record.id}
          name={record.name}
          externalId={record.externalId}
          writeProtected={record.writeProtected}
        />
      ),
      defaultSortOrder: getItemFromStorage('dataset-name-column') || undefined,
    },
    {
      Header: t('data-overview'),
      id: 'data-overview',
      dataIndex: 'id',
      width: 200,
      accessor: 'id',
      disableSortBy: true,
      Cell: ({ value }: CogsTableCellRenderer<DataSetRow>) => (
        <ResourceCountColumn dataSetId={value as number} />
      ),
    },
    {
      Header: t('description'),
      dataIndex: 'description',
      accessor: 'description',
      id: 'dataset-description-column',
      sorter: (a: DataSetRow, b: DataSetRow) =>
        stringCompare(a.description, b.description),

      width: '30%',
      defaultSortOrder:
        getItemFromStorage('dataset-description-column') || undefined,
    },
    ...(isExtpipeFlag ? [extpipeTableColumn(isExtpipesFetched)] : []),
    {
      Header: <div style={{ lineHeight: '32px' }}>{t('label_other')}</div>,
      accessor: 'labels',
      id: 'labels',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<DataSetRow>) => (
        <Flex gap={8} wrap="wrap">
          {record.labels?.length ? (
            record.labels.map((label: string) => (
              <Chip key={label} type="neutral" size="medium" label={label} />
            ))
          ) : (
            <></>
          )}
        </Flex>
      ),
    },
    {
      Header: t('governance-status'),
      accessor: 'quality',
      id: 'quality',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<DataSetRow>) => (
        <GovernanceStatus isGoverned={record.quality} />
      ),
    },
  ];

  const extpipeTableColumn = (isExtpipesFetched?: boolean) => {
    return {
      Header: t('extraction-pipelines'),
      accessor: 'extpipes',
      key: 'extpipes',
      id: 'extpipes',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<DataSetRow>) => {
        if (!isExtpipesFetched) {
          return <Icon type="Loader" />;
        }

        const extpipes = record.extpipes;
        const extpipesToDisplay = extpipes.slice(0, 2);

        return (
          <Flex direction="column">
            {Array.isArray(record.extpipes) &&
              extpipesToDisplay.map((extpipe: any) => {
                return (
                  <>
                    <ExtractionPipelineName
                      id={extpipe.id}
                      name={extpipe.name}
                    />
                  </>
                );
              })}
            {extpipes.length > extpipesToDisplay.length &&
              t('and-more', {
                count: extpipes.length - extpipesToDisplay.length,
              })}
          </Flex>
        );
      },
    };
  };

  return { getTableColumns };
};
