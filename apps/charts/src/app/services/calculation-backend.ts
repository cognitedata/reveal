import queryString from 'query-string';

import {
  Calculation,
  CalculationResult,
  CalculationsApi,
  StatisticsApi,
  ThresholdsApi,
  OperationsApi,
  DataProfilingApi,
  CreateStatisticsParams,
  CreateDataProfilingParams,
  StatisticsResult,
  DataProfilingResult,
  Status,
  Configuration,
  Operation,
  StatusStatusEnum,
  ThresholdResult,
  CreateThresholdsParams,
  CalculationResultDatapointsInner,
} from '@cognite/calculation-backend';
import { getCluster } from '@cognite/cdf-utilities';
import { fetchCalculationQueryResult } from '@cognite/charts-lib';
import { parseEnvFromCluster } from '@cognite/login-utils';
import {
  CogniteClient,
  DatapointsMultiQuery,
  DoubleDatapoint,
} from '@cognite/sdk';

import { WorkflowResult } from '../models/calculation-results/types';
import { BACKEND_SERVICE_URL_KEY } from '../utils/constants';
import { isProduction } from '../utils/environment';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backendServiceBaseUrlFromQuery = queryString.parse(
  window.location.search
)[BACKEND_SERVICE_URL_KEY] as string;

export const getBackendServiceBaseUrl = (cluster?: string) => {
  const stagingPart = isProduction ? '' : 'staging';
  const env = parseEnvFromCluster(cluster || '');

  const domain = ['calculation-backend', stagingPart, env, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');

  return `https://${domain}/v4_1`;
};

async function getConfig(sdk: CogniteClient): Promise<Configuration> {
  await sdk.get('/api/v1/token/inspect');
  const { Authorization } = sdk.getDefaultRequestHeaders();
  const cluster = getCluster();

  if (!Authorization) {
    throw new Error('Authorization header missing');
  }

  return new Configuration({
    ...(backendServiceBaseUrlFromQuery
      ? { basePath: backendServiceBaseUrlFromQuery }
      : { basePath: getBackendServiceBaseUrl(cluster as string) }),
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
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new CalculationsApi(config);
  const { data } = await api.createGraphCalculation(sdk.project, definition);
  return data;
}

export async function fetchCalculationStatus(
  sdk: CogniteClient,
  id: string
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = await new CalculationsApi(config);
  const { data } = await api.getGraphCalculationStatus(sdk.project, id);
  return data;
}

export async function fetchCalculationResult(
  sdk: CogniteClient,
  id: string
): Promise<CalculationResult> {
  const config = await getConfig(sdk);
  const api = await new CalculationsApi(config);
  const { data } = await api.getGraphCalculationResult(sdk.project, id);
  return data;
}

export async function fetchCalculationQueriesResult(
  sdk: CogniteClient,
  ids: string[],
  query: DatapointsMultiQuery
): Promise<WorkflowResult[]> {
  return Promise.all(
    ids.map((callId) => fetchCalculationQueryResult(sdk, callId, query))
  );
}

export async function waitForCalculationToFinish(
  sdk: CogniteClient,
  id: string
) {
  let calculationStatus = await fetchCalculationStatus(sdk, id);

  while (
    (
      [StatusStatusEnum.Pending, StatusStatusEnum.Running] as StatusStatusEnum[]
    ).includes(calculationStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    calculationStatus = await fetchCalculationStatus(sdk, id);
  }
}

export async function createDataProfiling(
  sdk: CogniteClient,
  createDataProfilingParams: CreateDataProfilingParams
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new DataProfilingApi(config);
  const { data } = await api.createDataProfilingCalculation(
    sdk.project,
    createDataProfilingParams
  );
  return data;
}

export async function fetchDataProfilingStatus(
  sdk: CogniteClient,
  id: string
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new DataProfilingApi(config);
  const { data } = await api.getDataProfilingCalculationStatus(sdk.project, id);
  return data;
}

export async function fetchDataProfilingResult(
  sdk: CogniteClient,
  id: string | number
): Promise<DataProfilingResult> {
  const config = await getConfig(sdk);
  const api = new DataProfilingApi(config);
  const { data } = await api.getDataProfilingCalculationResult(
    sdk.project,
    String(id)
  );
  return data;
}

export async function waitForDataProfilingToFinish(
  sdk: CogniteClient,
  id: string
) {
  let dataProfilingStatus = await fetchDataProfilingStatus(sdk, id);

  while (
    (
      [StatusStatusEnum.Pending, StatusStatusEnum.Running] as StatusStatusEnum[]
    ).includes(dataProfilingStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    dataProfilingStatus = await fetchDataProfilingStatus(sdk, id);
  }

  return dataProfilingStatus;
}

export async function createStatistics(
  sdk: CogniteClient,
  createStatisticsParams: CreateStatisticsParams
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.createStatisticsCalculation(
    sdk.project,
    createStatisticsParams
  );
  return data;
}

export async function fetchStatisticsStatus(
  sdk: CogniteClient,
  id: string
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.getStatisticsCalculationStatus(sdk.project, id);
  return data;
}

export async function waitForStatisticsToFinish(
  sdk: CogniteClient,
  id: string
) {
  let statisticsStatus = await fetchStatisticsStatus(sdk, id);

  while (
    (
      [StatusStatusEnum.Pending, StatusStatusEnum.Running] as StatusStatusEnum[]
    ).includes(statisticsStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    statisticsStatus = await fetchStatisticsStatus(sdk, id);
  }

  return statisticsStatus;
}

export async function createThreshold(
  sdk: CogniteClient,
  createThresholdParams: CreateThresholdsParams
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new ThresholdsApi(config);
  const { data } = await api.createThresholdCalculation(
    sdk.project,
    createThresholdParams
  );
  return data;
}

async function fetchThresholdStatus(
  sdk: CogniteClient,
  id: string
): Promise<Status> {
  const config = await getConfig(sdk);
  const api = new ThresholdsApi(config);
  const { data } = await api.getThresholdCalculationStatus(sdk.project, id);
  return data;
}

export async function waitForThresholdToFinish(sdk: CogniteClient, id: string) {
  let thresholdStatus = await fetchThresholdStatus(sdk, id);

  while (
    (
      [StatusStatusEnum.Pending, StatusStatusEnum.Running] as StatusStatusEnum[]
    ).includes(thresholdStatus.status)
  ) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    thresholdStatus = await fetchThresholdStatus(sdk, id);
  }

  return thresholdStatus;
}

export async function fetchStatisticsResult(
  sdk: CogniteClient,
  id: string | number
): Promise<StatisticsResult> {
  const config = await getConfig(sdk);
  const api = new StatisticsApi(config);
  const { data } = await api.getStatisticsCalculationResult(
    sdk.project,
    String(id)
  );
  return data;
}

export async function fetchThresholdResult(
  sdk: CogniteClient,
  id: string | number
): Promise<ThresholdResult> {
  const config = await getConfig(sdk);
  const api = new ThresholdsApi(config);
  const { data } = await api.getThresholdCalculationResult(
    sdk.project,
    String(id)
  );
  return data;
}

export const formatCalculationResult = (
  result: {
    datapoints?: CalculationResultDatapointsInner[] | null;
  } = {}
): DoubleDatapoint[] => {
  return (result.datapoints || []).map(({ timestamp, value }) => ({
    timestamp: new Date(timestamp || 0),
    value: value ?? NaN,
  }));
};
