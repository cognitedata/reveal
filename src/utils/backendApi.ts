import queryString from 'query-string';
import { CogniteClient } from '@cognite/sdk';
import config, { getBackendServiceBaseUrl, getSidecar } from 'config';
import {
  BACKEND_SERVICE_URL_KEY,
  CLUSTER_KEY,
  FALLBACK_TO_FUNCTIONS_URL_KEY,
} from 'utils/constants';
import { getLoginStatus } from './login';

export type CogniteFunction = {
  id: number;
  externalId?: string;
  name: string;
  fileId: number;
  description?: string;
};

const backendServiceBaseUrlFromQuery = queryString.parse(
  window.location.search
)[BACKEND_SERVICE_URL_KEY] as string;

const fallBackToFunctions = queryString.parse(window.location.search)[
  FALLBACK_TO_FUNCTIONS_URL_KEY
] as string;

const urlCluster = queryString.parse(window.location.search)[CLUSTER_KEY];
const { cdfCluster } = getSidecar();

const cdfApiUrl = `https://${
  urlCluster || cdfCluster || 'api'
}.cognitedata.com`;

const getServiceClient = async (sdk: CogniteClient) => {
  const login = await getLoginStatus(sdk);

  if (!login?.id) {
    return sdk;
  }

  const client = new CogniteClient({
    appId: config.appId,
    baseUrl: fallBackToFunctions
      ? cdfApiUrl
      : backendServiceBaseUrlFromQuery || getBackendServiceBaseUrl(),
  });

  const accessToken = sdk
    .getDefaultRequestHeaders()
    .Authorization.split('Bearer ')[1];

  client.loginWithOAuth({
    project: sdk.project,
    accessToken,
  });

  return client;
};

export const getCalls = async (sdk: CogniteClient, fnId: number) => {
  const client = await getServiceClient(sdk);

  return client
    .get(`/api/playground/projects/${sdk.project}/functions/${fnId}/calls`)
    .then((response) => response?.data?.items || []);
};

export async function listFunctions(sdk: CogniteClient) {
  const client = await getServiceClient(sdk);

  return client
    .get<{ items: CogniteFunction[] }>(
      `/api/playground/projects/${sdk.project}/functions`
    )
    .then((r) => r.data?.items);
}

export async function callFunction(
  sdk: CogniteClient,
  functionId: number,
  data?: object
) {
  const client = await getServiceClient(sdk);

  return client
    .post(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/call`,
      {
        data: { data },
      }
    )
    .then((r) => r.data);
}

export async function getCallStatus(
  sdk: CogniteClient,
  functionId: number,
  callId: number
) {
  const client = await getServiceClient(sdk);

  return client
    .get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}`
    )
    .then((r) => r.data);
}

export async function getCallResponse(
  sdk: CogniteClient,
  functionId: number,
  callId: number
) {
  const client = await getServiceClient(sdk);

  return client
    .get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}/response`
    )
    .then((r) => r.data.response);
}
