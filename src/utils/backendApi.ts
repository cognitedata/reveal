import axios from 'axios';
import config from 'config';
import { getSdk } from './sdk';

export type CogniteFunction = {
  id: number;
  externalId?: string;
  name: string;
  fileId: number;
  description?: string;
};

const useBackendService = !!process.env.REACT_APP_BACKEND_SERVICE_BASE_URL;
const BACKEND_SERVICE_BASE_URL = process.env.REACT_APP_BACKEND_SERVICE_BASE_URL;
const CDF_API_BASE_URL = config.cdfApiBaseUrl;

console.log({ useBackendService, BACKEND_SERVICE_BASE_URL });

const sdk = getSdk();

const getServiceClient = () => {
  return axios.create({
    baseURL: useBackendService ? BACKEND_SERVICE_BASE_URL : CDF_API_BASE_URL,
    headers: sdk.getDefaultRequestHeaders(),
  });
};

export const getCalls = async (fnId: number) => {
  const client = getServiceClient();

  return client
    .get(`/api/playground/projects/${sdk.project}/functions/${fnId}/calls`)
    .then((response) => response?.data?.items || []);
};

export async function listFunctions() {
  const client = getServiceClient();

  return client
    .get<{ items: CogniteFunction[] }>(
      `/api/playground/projects/${sdk.project}/functions`
    )
    .then((r) => r.data?.items);
}

export async function callFunction(functionId: number, data?: object) {
  const client = getServiceClient();

  return client
    .post(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/call`,
      {
        data,
      }
    )
    .then((r) => r.data);
}

export async function getCallStatus(functionId: number, callId: number) {
  const client = getServiceClient();

  return client
    .get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}`
    )
    .then((r) => r.data);
}

export async function getCallResponse(functionId: number, callId: number) {
  const client = getServiceClient();

  return client
    .get(
      `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}/response`
    )
    .then((r) => r.data.response);
}
