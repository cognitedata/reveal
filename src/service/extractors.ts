import sdk from '@cognite/cdf-sdk-singleton';
import { ExtractorLibraryCategory } from 'components/category-sidebar/CategorySidebarItem';

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

export type ExtractorType = 'global' | 'unreleased';

export type ExtractorBase = {
  imageUrl?: string;
  externalId: string;
  name: string;
  description?: string;
  documentation?: string;
  type: ExtractorType;
  tags?: string[];
};

export type Extractor = ExtractorBase & {
  latestVersion: string | undefined;
  imageUrl: string;
  links?: ExtractorLink[];
};

export type Items<T> = {
  items: T[];
};

export type ExtractorWithReleases = Extractor & {
  category: ExtractorLibraryCategory;
  releases: Release[];
};

type ExtractorDownload = {
  downloadUrl: string;
};

export const getDownloadUrl = async (artifact: Artifact) => {
  return (await sdk.get<ExtractorDownload>(artifact.link)).data.downloadUrl;
};
