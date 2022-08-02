import sdk from '@cognite/cdf-sdk-singleton';
import { getEnv } from '@cognite/cdf-utilities';

export type Artifact = {
  name: string;
  link: string;
  platform: string;
  displayName: string | undefined;
};

export type Release = {
  version: string;
  createdTime: number | undefined;
  artifacts: Artifact[];
  externalId: string;
  description: string;
};

type Extractor = {
  externalId: string;
  name: string;
  description?: string;
  type: string;
  latestVersion: string | undefined;
  documentation?: string;
};

type Items<T> = {
  items: T[];
};

export type ExtractorWithRelease = {
  externalId: string;
  name: string;
  description?: string;
  type: string;
  releases: Release[];
  documentation?: string;
};

type ExtractorDownload = {
  downloadUrl: string;
};

export const getDownloadUrl = async (artifact: Artifact) => {
  const cluster = getEnv() || 'api';
  return (
    await sdk.get<ExtractorDownload>(artifact.link, {
      withCredentials: true,
      headers: {
        env: cluster as string,
      },
    })
  ).data.downloadUrl;
};

export const getExtractorsWithReleases = async () => {
  const extractorsPromise = sdk
    .get<Items<Extractor>>(
      `/api/playground/projects/${sdk.project}/extractors`,
      {
        withCredentials: true,
      }
    )
    .then((res) => res.data.items);
  const releasesPromise = sdk
    .get<Items<Release>>(
      `/api/playground/projects/${sdk.project}/extractors/releases`,
      {
        withCredentials: true,
      }
    )
    .then((res) => res.data.items);
  const extractorMap: { [externalId: string]: ExtractorWithRelease } = {};
  const [extractors, releases] = await Promise.all([
    extractorsPromise,
    releasesPromise,
  ]);

  extractors.forEach((extractor) => {
    extractorMap[extractor.externalId] = {
      ...extractor,
      externalId: extractor.externalId,
      name: extractor.name,
      description: extractor.description,
      type: extractor.type,
      releases: [],
    };
  });

  releases.forEach((release) => {
    extractorMap[release.externalId].releases.push(release);
  });

  return Object.values(extractorMap);
};
