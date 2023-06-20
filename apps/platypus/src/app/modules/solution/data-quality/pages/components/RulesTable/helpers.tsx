import { RuleSeverity } from '@data-quality/api/codegen';
import {
  TimeSeriesType,
  getLastDatapointValue,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';
import { toNumber } from 'lodash';

import { Body, Chip, Icon } from '@cognite/cogs.js';
import { Datapoints } from '@cognite/sdk/dist/src';

export const renderNameCell = (ruleName: string) => {
  return <Body level={2}>{ruleName}</Body>;
};

export const renderSeverityCell = (severity: RuleSeverity) => {
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

export const renderValidityCell = (
  ruleId: string,
  datapoints: Datapoints[],
  loadingDatapoints: boolean,
  dataSourceId?: string
) => {
  if (!dataSourceId) return renderCell();

  const timeSeriesId = getTimeSeriesId(
    TimeSeriesType.SCORE,
    dataSourceId,
    ruleId
  );
  const value = getLastDatapointValue(datapoints, timeSeriesId);
  const cellValue =
    value !== undefined ? `${Math.round(toNumber(value) * 100)}%` : value;

  return renderCell(cellValue, loadingDatapoints);
};

export const renderItemsCheckedCell = (
  ruleId: string,
  datapoints: Datapoints[],
  loadingDatapoints: boolean,
  dataSourceId?: string
) => {
  if (!dataSourceId) return renderCell();

  const timeSeriesId = getTimeSeriesId(
    TimeSeriesType.TOTAL_ITEMS_COUNT,
    dataSourceId,
    ruleId
  );
  const cellValue = getLastDatapointValue(datapoints, timeSeriesId);

  return renderCell(cellValue, loadingDatapoints);
};

/** General render cell with loading, error, and success cases. */
const renderCell = (cellValue?: string | number, isLoading?: boolean) => {
  if (isLoading) return <Icon aria-label="Loading cell data" type="Loader" />;

  if (cellValue === undefined)
    return (
      <Body level={2} muted>
        <i>No data found</i>
      </Body>
    );

  return <Body level={2}>{cellValue?.toLocaleString()}</Body>;
};

/** Get the latest timestamp from a set of datapoints */
export const getLastValidationTime = (tsDatapoints: Datapoints[]) => {
  return tsDatapoints[0]?.datapoints[0]?.timestamp;
};
