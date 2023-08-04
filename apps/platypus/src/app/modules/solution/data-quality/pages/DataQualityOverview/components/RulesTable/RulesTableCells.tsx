import { PropsWithChildren } from 'react';

import { RuleSeverity } from '@data-quality/api/codegen';
import {
  TimeSeriesType,
  getDatapointsById,
  getLastDatapointValue,
  getScoreValue,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';

import { A, Body, Chip, Flex, Heading, Icon } from '@cognite/cogs.js';
import { Datapoints } from '@cognite/sdk/dist/src';

import { ValidationDifference } from '..';

type NameCellProps = {
  onClick: VoidFunction;
  ruleName: string;
};

type SeverityCellProps = {
  severity: RuleSeverity;
};

type ValidityCellProps = {
  ruleId: string;
  datapoints: Datapoints[];
  loadingDatapoints: boolean;
  dataSourceId?: string;
};

type ItemsCheckedCellProps = {
  ruleId: string;
  datapoints: Datapoints[];
  loadingDatapoints: boolean;
  dataSourceId?: string;
};

type CellProps = {
  isLoading?: boolean;
  value?: string | number;
} & PropsWithChildren;

export const NameCell = ({ onClick, ruleName }: NameCellProps) => {
  return (
    <Heading level={5}>
      <A onClick={onClick}>{ruleName}</A>
    </Heading>
  );
};

export const SeverityCell = ({ severity }: SeverityCellProps) => {
  switch (severity) {
    case 'Critical':
      return <Chip icon="Error" label={severity} type="danger" />;
    case 'High':
      return <Chip icon="Warning" label={severity} type="warning" />;
    case 'Medium':
      return <Chip label={severity} type="warning" />;
    case 'Low':
      return <Chip label={severity} type="neutral" />;
    default:
      return <Chip label={severity} />;
  }
};

export const ValidityCell = ({
  datapoints,
  dataSourceId,
  loadingDatapoints,
  ruleId,
}: ValidityCellProps) => {
  if (!dataSourceId) return <Cell />;

  const timeSeriesId = getTimeSeriesId(
    TimeSeriesType.SCORE,
    dataSourceId,
    ruleId
  );

  const scoreDatapoints = getDatapointsById(datapoints, timeSeriesId);
  const value = getLastDatapointValue(datapoints, timeSeriesId);
  const cellValue = getScoreValue(value);

  return (
    <Cell isLoading={loadingDatapoints} value={cellValue}>
      <ValidationDifference tsDatapoints={scoreDatapoints} showStaleState />
    </Cell>
  );
};

export const ItemsCheckedCell = ({
  datapoints,
  dataSourceId,
  loadingDatapoints,
  ruleId,
}: ItemsCheckedCellProps) => {
  if (!dataSourceId) return <Cell />;

  const timeSeriesId = getTimeSeriesId(
    TimeSeriesType.TOTAL_ITEMS_COUNT,
    dataSourceId,
    ruleId
  );
  const totalInstancesDatapoints = getDatapointsById(datapoints, timeSeriesId);
  const cellValue = getLastDatapointValue(datapoints, timeSeriesId);

  return (
    <Cell isLoading={loadingDatapoints} value={cellValue}>
      <ValidationDifference tsDatapoints={totalInstancesDatapoints} />
    </Cell>
  );
};

/** General render cell with loading, error, and success cases. */
const Cell = ({ isLoading, value, children }: CellProps) => {
  if (isLoading) return <Icon aria-label="Loading cell data" type="Loader" />;

  if (value === undefined)
    return (
      <Body size="small" muted>
        <i>No data found</i>
      </Body>
    );

  return (
    <Flex alignItems="center" direction="row" gap={8}>
      <Body size="small">{value?.toLocaleString()}</Body>
      {children}
    </Flex>
  );
};
