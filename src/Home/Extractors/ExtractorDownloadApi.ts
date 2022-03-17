import { getCdfEnvFromUrl } from 'utils/utils';
import sdk from '@cognite/cdf-sdk-singleton';

const baseUrl =
  process.env.REACT_APP_EXTRACTOR_DOWNLOAD_API != null
    ? process.env.REACT_APP_EXTRACTOR_DOWNLOAD_API
    : 'https://extractor-download.cognite.ai';

export const getDownloadUrl = async (
  extractor: string,
  version: string,
  platform: string
) => {
  const cluster = getCdfEnvFromUrl() || 'api';
  return sdk.get(`${baseUrl}/extractors/${extractor}/${version}/${platform}`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};

export const listExtractors = async () => {
  const cluster = getCdfEnvFromUrl() || 'api';
  return sdk.get(`${baseUrl}/extractors?label=global`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};

export const listReleases = async () => {
  const cluster = getCdfEnvFromUrl() || 'api';
  return sdk.get(`${baseUrl}/extractors/releases`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};
