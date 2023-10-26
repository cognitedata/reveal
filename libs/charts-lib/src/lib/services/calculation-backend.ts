import queryString from 'query-string';

import {
  CalculationsApi,
  Configuration,
  CalculationResultQuery,
} from '@cognite/calculation-backend';
import { getCluster } from '@cognite/cdf-utilities';
import { parseEnvFromCluster } from '@cognite/login-utils';
import {
  CogniteClient,
  DatapointAggregate,
  DatapointsMultiQuery,
} from '@cognite/sdk';

import { WorkflowResult } from '../components/PlotlyChart/types';
import { isProduction } from '../environment';
import { BACKEND_SERVICE_URL_KEY } from '../utils/constants';

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
