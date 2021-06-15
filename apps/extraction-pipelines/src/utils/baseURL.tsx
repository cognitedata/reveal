import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { StringifyOptions } from 'query-string';

export const EXTRACTION_PIPELINE_PATH: Readonly<string> = 'extpipes';
export const PROJECT_ITERA_INT_GREEN: Readonly<string> = 'itera-int-green';
export const ORIGIN_DEV: Readonly<string> = 'dev';
export const CDF_ENV_GREENFIELD: Readonly<string> = 'greenfield';

const getBaseUrl = (project: string): string => {
  return `/api/playground/projects/${project}/${EXTRACTION_PIPELINE_PATH}`;
};
const createExtPipePath = (
  path?: string,
  queries?: any,
  opts?: StringifyOptions
) => {
  return createLink(`/${EXTRACTION_PIPELINE_PATH}${path}`, queries, opts);
};
const get = async <D extends object>(
  route: string,
  project: string,
  params = ''
) => {
  return sdkv3.get<D>(`${getBaseUrl(project)}${route}${params}`, {
    withCredentials: true,
  });
};

const post = async <Response extends object, D>(
  route: string,
  project: string,
  data: D,
  params = ''
) => {
  return sdkv3.post<Response>(`${getBaseUrl(project)}${route}${params}`, {
    data,
    withCredentials: true,
  });
};

export { get, getBaseUrl, post, createExtPipePath };
