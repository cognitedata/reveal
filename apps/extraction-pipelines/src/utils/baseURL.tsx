import { sdkv3 } from '@cognite/cdf-sdk-singleton';

const getBaseUrl = (project: string): string => {
  return `https://greenfield.cognitedata.com/api/playground/projects/${project}`;
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

export default get;
