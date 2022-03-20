import sdk from '@cognite/cdf-sdk-singleton';
import { getEnv } from '@cognite/cdf-utilities';

const baseUrl =
  process.env.REACT_APP_EXTRACTOR_DOWNLOAD_API != null
    ? process.env.REACT_APP_EXTRACTOR_DOWNLOAD_API
    : 'https://extractor-download.cognite.ai';

export const getDownloadUrl = async (
  extractor: string,
  version: string,
  platform: string
) => {
  const cluster = getEnv() || 'api';
  return sdk.get(`${baseUrl}/extractors/${extractor}/${version}/${platform}`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};

export const listExtractors = async () => {
  const cluster = getEnv() || 'api';
  return sdk.get(`${baseUrl}/extractors?label=global`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};

export const listReleases = async () => {
  const cluster = getEnv() || 'api';
  return sdk.get(`${baseUrl}/extractors/releases`, {
    headers: {
      env: cluster as string,
    },
    withCredentials: true,
  });
};
