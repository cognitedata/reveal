import styled from 'styled-components';
import { Body, Colors, Flex, Icon, Label, Tooltip } from '@cognite/cogs.js';
import { stringCompare } from 'utils/shared';
import { getItemFromStorage } from 'utils/localStorage';
import { DataSet, DataSetV3, Extpipe } from 'utils/types';
import isArray from 'lodash/isArray';
import { useTranslation } from 'common/i18n';
import DataSetName from 'components/data-sets-list/data-set-name';
import ExtractionPipelineName from 'components/data-sets-list/extraction-pipeline-name';
import GovernanceStatus from 'components/data-sets-list/governance-status';
import { useResourceAggregates } from 'hooks/useResourceAggregates';

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
          <StyledLabelCount size="small" icon="Assets" variant="unknown">
            <Body level={2} strong>
              {assetCount.toLocaleString()}
            </Body>
          </StyledLabelCount>
        </Tooltip>
      )}
      {timeseriesCount > 0 && (
        <Tooltip
          content={`${timeseriesCount.toLocaleString()} ${t('time-series', {
            postProcess: 'lowercase',
          })}`}
        >
          <StyledLabelCount size="small" icon="Timeseries" variant="unknown">
            <Body level={2} strong>
              {timeseriesCount.toLocaleString()}
            </Body>
          </StyledLabelCount>
        </Tooltip>
      )}
      {filesCount > 0 && (
        <Tooltip
          content={`${filesCount.toLocaleString()} ${t('files', {
            postProcess: 'lowercase',
          })}`}
        >
          <StyledLabelCount size="small" icon="Document" variant="unknown">
            <Body level={2} strong>
              {filesCount.toLocaleString()}
            </Body>
          </StyledLabelCount>
        </Tooltip>
      )}
      {eventsCount > 0 && (
        <Tooltip
          content={`${eventsCount.toLocaleString()} ${t('events', {
            postProcess: 'lowercase',
          })}`}
        >
          <StyledLabelCount size="small" icon="Events" variant="unknown">
            <Body level={2} strong>
              {eventsCount.toLocaleString()}
            </Body>
          </StyledLabelCount>
        </Tooltip>
      )}
      {sequencesCount > 0 && (
        <Tooltip
          content={`${sequencesCount.toLocaleString()} ${t('sequence_other', {
            postProcess: 'lowercase',
          })}`}
        >
          <StyledLabelCount size="small" icon="Sequences" variant="unknown">
            <Body level={2} strong>
              {sequencesCount.toLocaleString()}
            </Body>
          </StyledLabelCount>
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
const StyledLabelCount = styled(Label)`
  background: ${Colors['surface--muted']};
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
      dataSet.metadata.consoleLabels.forEach((label) => {
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
      title: t('name'),
      dataIndex: 'name',
      key: 'dataset-name-column',
      sorter: (a: DataSetRow, b: DataSetRow) => stringCompare(a.name, b.name),
      render: (_value: string, record: DataSetRow) => (
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
      title: t('data-overview'),
      key: 'data-overview',
      dataIndex: 'id',
      width: '200px',
      render: (value: number) => <ResourceCountColumn dataSetId={value} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'dataset-description-column',
      render: (_value: string, record: DataSetRow) => (
        <span>{record.description}</span>
      ),
      sorter: (a: DataSetRow, b: DataSetRow) =>
        stringCompare(a.description, b.description),

      width: '30%',
      defaultSortOrder:
        getItemFromStorage('dataset-description-column') || undefined,
    },
    ...(isExtpipeFlag ? [extpipeTableColumn(isExtpipesFetched)] : []),
    {
      title: <div style={{ lineHeight: '32px' }}>{t('label_other')}</div>,
      dataIndex: 'labels',
      key: 'labels',
      render: (field: []) => (
        <Flex gap={8} wrap="wrap">
          {field?.length ? (
            field.map((label: string) => <Label size="medium">{label}</Label>)
          ) : (
            <></>
          )}
        </Flex>
      ),
    },
    {
      title: t('governance-status'),
      key: 'quality',
      render: (row: DataSetRow) => {
        return <GovernanceStatus isGoverned={row.quality} />;
      },
    },
  ];

  const extpipeTableColumn = (isExtpipesFetched?: boolean) => {
    return {
      title: t('extraction-pipelines'),
      dataIndex: 'extpipes',
      key: 'extpipes',
      render: (_value: string, record: DataSetRow) => {
        if (!isExtpipesFetched) {
          return <Icon type="Loader" />;
        }

        const extpipes = record.extpipes;
        const extpipesToDisplay = extpipes.slice(0, 2);

        return (
          <Flex direction="column">
            {Array.isArray(record.extpipes) &&
              extpipesToDisplay.map((extpipe) => {
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
