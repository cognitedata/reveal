import queryString from 'query-string';

import {
  Calculation,
  CalculationResult,
  CalculationsApi,
  StatisticsApi,
  OperationsApi,
  CalculationStatus,
  CreateStatisticsParams,
  StatisticsResult,
  StatisticsStatus,
  Configuration,
  CalculationResultDatapoints,
  Operation,
  CalculationStatusStatusEnum,
  StatisticsStatusStatusEnum,
} from '@cognite/calculation-backend';

import { BACKEND_SERVICE_URL_KEY, CLUSTER_KEY } from 'utils/constants';
import { CogniteClient, DoubleDatapoint } from '@cognite/sdk';
import { isProduction } from 'utils/environment';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const backendServiceBaseUrlFromQuery = queryString.parse(
  window.location.search
)[BACKEND_SERVICE_URL_KEY] as string;

export const getBackendServiceBaseUrl = (cluster?: string) => {
  const stagingPart = isProduction ? '' : 'staging';

  const domain = ['calculation-backend', stagingPart, cluster, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');

  return `https://${domain}/v3`;
};

async function getConfig(sdk: CogniteClient): Promise<Configuration> {
  await sdk.get('/api/v1/token/inspect');
  const { Authorization } = sdk.getDefaultRequestHeaders();
  const urlCluster = queryString.parse(window.location.search)[
    CLUSTER_KEY
  ] as string;

  if (!Authorization) {
    throw new Error('Authorization header missing');
  }

  return new Configuration({
    ...(backendServiceBaseUrlFromQuery
      ? { basePath: backendServiceBaseUrlFromQuery }
      : { basePath: getBackendServiceBaseUrl(urlCluster) }),
    accessToken: Authorization.replace(/Bearer /, ''),
  });
}

export async function fetchOperations(
  sdk: CogniteClient
): Promise<Operation[]> {
  const config = await getConfig(sdk);
  const api = new OperationsApi(config);
  const { data } = await api.getOperations(sdk.project);
  return data;
}

export async function createCalculation(
  sdk: CogniteClient,
  definition: Calculation
): Promise<CalculationStatus> {
  const config = await getConfig(sdk);
  const api = new CalculationsApi(config);
  const { data } = await api.createCalculation(sdk.project, definition);
  return data;
}

export async function fetchCalculationStatus(
  sdk: CogniteClient,
  id: string
): Promise<CalculationStatus> {
  const config = await getConfig(sdk);
  const api = await new CalculationsApi(config);
  const { data } = await api.getCalculationStatus(sdk.project, id);
  return data;
}

export async function fetchCalculationResult(
  sdk: CogniteClient,
  id: string
): Promise<CalculationResult> {
  const config = await getConfig(sdk);
  const api = await new CalculationsApi(config);
  const { data } = await api.getCalculationResult(sdk.project, id);
  return data;
}

export async function waitForCalculationToFinish(
  sdk: CogniteClient,
  id: string
) {
  let calculationStatus = await fetchCalculationStatus(sdk, id);

  while (
    (
      [
        CalculationStatusStatusEnum.Pending,
        CalculationStatusStatusEnum.Running,
      ] as CalculationStatusStatusEnum[]
    ).includes(calculationStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    calculationStatus = await fetchCalculationStatus(sdk, id);
  }
}

export async function fetchCalculationResultWhenDone(
  sdk: CogniteClient,
  id: string
) {
  await waitForCalculationToFinish(sdk, id);
  const result = await fetchCalculationResult(sdk, id);
  return formatCalculationResult(result);
}

export async function createStatistics(
  sdk: CogniteClient,
  createStatisticsParams: CreateStatisticsParams
): Promise<StatisticsStatus> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.createStatistics(
    sdk.project,
    createStatisticsParams
  );
  return data;
}

export async function fetchStatisticsStatus(
  sdk: CogniteClient,
  id: string
): Promise<StatisticsStatus> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.getStatisticsStatus(sdk.project, id);
  return data;
}

export async function waitForStatisticsToFinish(
  sdk: CogniteClient,
  id: string
) {
  let statisticsStatus = await fetchStatisticsStatus(sdk, id);

  while (
    (
      [
        StatisticsStatusStatusEnum.Pending,
        StatisticsStatusStatusEnum.Running,
      ] as StatisticsStatusStatusEnum[]
    ).includes(statisticsStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    statisticsStatus = await fetchStatisticsStatus(sdk, id);
  }

  return statisticsStatus;
}

export async function fetchStatisticsResult(
  sdk: CogniteClient,
  id: string | number
): Promise<StatisticsResult> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.getStatisticsResult(sdk.project, String(id));
  return data;
}

export const formatCalculationResult = (
  result: {
    datapoints?: CalculationResultDatapoints[] | null;
  } = {}
): DoubleDatapoint[] => {
  return (result.datapoints || []).map(({ timestamp, value }) => ({
    timestamp: new Date(timestamp || 0),
    value: value ?? NaN,
  }));
};
