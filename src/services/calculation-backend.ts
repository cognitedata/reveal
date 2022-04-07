import queryString from 'query-string';

import {
  Calculation,
  CalculationResult,
  CalculationsApi,
  StatisticsApi,
  OperationsApi,
  CreateStatisticsParams,
  StatisticsResult,
  Status,
  Configuration,
  CalculationResultDatapoints,
  Operation,
  StatusStatusEnum,
  CalculationResultQuery,
} from '@cognite/calculation-backend';

import { BACKEND_SERVICE_URL_KEY, CLUSTER_KEY } from 'utils/constants';
import {
  CogniteClient,
  DatapointAggregate,
  DatapointsMultiQuery,
  DoubleDatapoint,
} from '@cognite/sdk';
import { isProduction } from 'utils/environment';
import { WorkflowResult } from 'models/workflows/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backendServiceBaseUrlFromQuery = queryString.parse(
  window.location.search
)[BACKEND_SERVICE_URL_KEY] as string;

export const getBackendServiceBaseUrl = (cluster?: string) => {
  const stagingPart = isProduction ? '' : 'staging';

  const domain = ['calculation-backend', stagingPart, cluster, 'cognite', 'ai']
    .filter(Boolean)
    .join('.');

  return `https://${domain}/v4`;
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

function getResultQueriesFromDatapointMultiQuery(
  query: DatapointsMultiQuery
): CalculationResultQuery[] {
  if (!query.aggregates?.length) {
    return [];
  }

  return query.aggregates.map((aggregate) => {
    return {
      start_time: new Date(query.start || new Date()).getTime(),
      end_time: new Date(query.end || new Date()).getTime(),
      aggregate: aggregate as CalculationResultQuery['aggregate'],
      granularity: query.granularity,
      limit: query.limit,
    };
  });
}

export async function fetchCalculationQueryResult(
  sdk: CogniteClient,
  id: string,
  query: DatapointsMultiQuery
): Promise<WorkflowResult> {
  const config = await getConfig(sdk);
  const api = await new CalculationsApi(config);

  if (!query.aggregates?.length) {
    const inputQuery: CalculationResultQuery = {
      start_time: new Date(query.start || new Date()).getTime(),
      end_time: new Date(query.end || new Date()).getTime(),
    };

    const { data } = await api.createGraphCalculationResultQuery(
      sdk.project,
      id,
      inputQuery
    );

    return {
      id,
      datapoints: (data.datapoints || []).map((datapoint) => {
        return {
          timestamp: new Date(datapoint.timestamp),
          value: datapoint.value,
        };
      }),
      warnings: data.warnings,
      error: data.error,
      isDownsampled: data.exceeded_server_limits,
    };
  }

  const queries = getResultQueriesFromDatapointMultiQuery(query);

  const queryResultPromises = queries.map(async (q) => {
    return {
      aggregate: q.aggregate,
      result: (await api.createGraphCalculationResultQuery(sdk.project, id, q))
        .data,
    };
  });

  const queryResults = await Promise.all(queryResultPromises);

  const datapoints: DatapointAggregate[] = (
    queryResults[0].result.datapoints || []
  ).map((dp, index) => {
    return {
      timestamp: new Date(dp.timestamp),
      ...(query.aggregates || []).reduce((output, aggregate) => {
        return {
          ...output,
          [aggregate]: (queryResults.find(
            (queryResult) => queryResult.aggregate === aggregate
          )?.result.datapoints || [])[index].value,
        };
      }, {}),
    };
  });

  return {
    id,
    datapoints,
    warnings: queryResults[0].result.warnings,
    error: queryResults[0].result.error,
    isDownsampled: queryResults[0].result.exceeded_server_limits,
  };
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
