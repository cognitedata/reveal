import sdk from '@cognite/cdf-sdk-singleton';

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
  changelog: { [key: string]: string[] };
};

export type ExtractorLink = {
  type: 'generic' | 'externalDocumentation';
  url: string;
  name: string;
};

export type ExtractorType = 'global' | 'community' | 'unreleased';

export type Extractor = {
  externalId: string;
  name: string;
  description?: string;
  type: ExtractorType;
  latestVersion: string | undefined;
  documentation?: string;
  imageUrl: string;
  tags?: string[];
  links?: ExtractorLink[];
};

type Items<T> = {
  items: T[];
};

export type ExtractorWithReleases = Extractor & { releases: Release[] };

type ExtractorDownload = {
  downloadUrl: string;
};

export const getDownloadUrl = async (artifact: Artifact) => {
  return (await sdk.get<ExtractorDownload>(artifact.link)).data.downloadUrl;
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
  const extractorMap: { [externalId: string]: ExtractorWithReleases } = {};
  const [extractors, releases] = await Promise.all([
    extractorsPromise,
    releasesPromise,
  ]);

  extractors.forEach((extractor) => {
    extractorMap[extractor.externalId] = {
      ...extractor,
      releases: [],
    };
  });

  releases.forEach((release) => {
    extractorMap[release.externalId].releases.push(release);
  });

  return Object.values(extractorMap);
};
