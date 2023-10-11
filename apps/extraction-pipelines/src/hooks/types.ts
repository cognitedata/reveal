import { CogniteExternalId } from '@cognite/sdk-playground';

export type CreateExtractorMapping = {
  externalId: CogniteExternalId;
  mapping: {
    expression: string;
  };
  published: boolean;
};

export type ExtractorMapping = {
  externalId: string;
  mapping: {
    expression: string;
  };
  published: boolean;
  lastUpdatedTime: number;
  createdTime: number;
};
