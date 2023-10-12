import { PropsWithChildren } from 'react';

import {
  A,
  Body,
  Chip,
  ChipProps,
  Flex,
  Heading,
  Icon,
  Tooltip,
} from '@cognite/cogs.js';
import { LineChart } from '@cognite/plotting-components';
import { Datapoints } from '@cognite/sdk/dist/src';

import { ValidationDifference } from '..';
import { RuleRunStatus, RuleSeverity } from '../../../../api/codegen';
import {
  chartConfig,
  formatScoreDotTooltip,
  getScoreChartData,
} from '../../../../utils/charts';
import {
  TimeSeriesType,
  getDatapointsById,
  getLastDatapointValue,
  getScoreValue,
  getTimeSeriesId,
} from '../../../../utils/validationTimeseries';

type NameCellProps = {
  onClick: VoidFunction;
  ruleName: string;
};

type SeverityCellProps = {
  severity: RuleSeverity;
};

type StatusCellProps = {
  message?: string;
  status: RuleRunStatus;
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
  value?: string | number | null;
} & PropsWithChildren;

export const NameCell = ({ onClick, ruleName }: NameCellProps) => {
  return (
    <Heading level={5}>
      <A onClick={onClick}>{ruleName}</A>
    </Heading>
  );
};

export const SeverityCell = ({ severity }: SeverityCellProps) => {
  const severityType: Record<RuleSeverity, ChipProps['type']> = {
    Critical: 'danger',
    High: 'warning',
    Medium: 'neutral',
    Low: 'default',
  };

  return <Chip label={severity} size="small" type={severityType[severity]} />;
};

export const StatusCell = ({ message, status }: StatusCellProps) => {
  const chipProps: Record<RuleRunStatus, ChipProps> = {
    Error: { icon: 'Error', type: 'danger' },
    InProgress: { icon: 'Loader' },
    Success: { icon: 'CheckmarkAlternative', type: 'success' },
  };
  const tooltipMessages: Record<RuleRunStatus, string> = {
    Error: message || 'Unknown error',
    InProgress: 'Validation in progress',
    Success: 'Validation succeeded',
  };

  return (
    <Tooltip content={tooltipMessages[status]}>
      <Chip size="small" {...chipProps[status]} />
    </Tooltip>
  );
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

export const ValidityOverTimeCell = ({
  datapoints,
  dataSourceId,
  loadingDatapoints,
  ruleId,
}: ValidityCellProps) => {
  if (!dataSourceId) return <Cell />;

  const timeSeriesIdScore = getTimeSeriesId(
    TimeSeriesType.SCORE,
    dataSourceId,
    ruleId
  );

  const scoreDatapoints = getDatapointsById(datapoints, timeSeriesIdScore);
  const noDatapoints = scoreDatapoints?.datapoints.length === 0;

  if (noDatapoints) return <Cell />;

  const dataScore = getScoreChartData(scoreDatapoints);

  return (
    <Cell isLoading={loadingDatapoints} value={null}>
      <LineChart
        config={chartConfig}
        data={dataScore}
        variant="small"
        formatTooltipContent={formatScoreDotTooltip}
        layout={{ showTickLabels: false }}
        style={{ backgroundColor: 'transparent', height: 40, width: 180 }}
      />
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
