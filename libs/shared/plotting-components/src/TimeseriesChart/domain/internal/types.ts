import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk';

import { DataFetchMode, DateRange, TimeseriesItem } from '../../types';

export interface TimeseriesChartQuery {
  timeseries: TimeseriesItem[];
  dateRange?: DateRange;
  numberOfPoints?: number;
}

export interface TimeseriesChartMetadata {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  numberOfPoints: number;
  dataFetchMode: DataFetchMode;
  isStep?: boolean;
  isString?: boolean;
  unit?: string;
  color?: string;
}
