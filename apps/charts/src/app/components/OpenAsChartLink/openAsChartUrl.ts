interface CommonProps {
  project: string;
  startDate: string | number | Date;
  endDate: string | number | Date;
  cluster?:
    | ''
    | 'westeurope-1'
    | 'asia-northeast1-1'
    | 'az-eastus-1'
    | 'bp-northeurope'
    | 'omv'
    | 'pgs'
    | 'power-no'
    | 'az-power-no-northeurope'
    | 'statnett'
    | 'greenfield'
    | 'bluefield'
    | 'azure-dev';
  chartName?: string;
  origin?: string;
}

interface TimeSeriesIdInput extends CommonProps {
  timeseriesIds: number[];
  timeseriesExternalIds?: string[];
}

interface TimeSeriesExternalIdInput extends CommonProps {
  timeseriesExternalIds: string[];
  timeseriesIds?: number[];
}

type Props = TimeSeriesIdInput | TimeSeriesExternalIdInput;

export function openAsChartURL({
  project,
  startDate,
  endDate,
  timeseriesIds = [],
  timeseriesExternalIds = [],
  cluster = '',
  chartName = '',
  origin = 'https://charts.cogniteapp.com',
}: Props) {
  if (
    [timeseriesExternalIds, timeseriesIds].every((param) => param.length === 0)
  )
    throw new Error('You need to declare some timeseries');

  const queryString: Record<string, string> = {
    startTime: new Date(startDate).getTime().toString(),
    endTime: new Date(endDate).getTime().toString(),
  };
  if (timeseriesIds.length > 0)
    queryString.timeseriesIds = timeseriesIds.join(',');
  if (timeseriesExternalIds.length > 0)
    queryString.timeserieExternalIds = timeseriesExternalIds.join(',');
  if (chartName) queryString.chartName = chartName;
  if (cluster) queryString.env = cluster;
  const query = new URLSearchParams(queryString).toString();
  return `${origin}/${project}/?${query}`;
}
