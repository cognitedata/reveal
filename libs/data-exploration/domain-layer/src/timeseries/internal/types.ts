import { CogniteExternalId, CogniteInternalId, Metadata } from '@cognite/sdk';
import { InternalCommonFilters, MatchingLabels } from '../../types';
export interface InternalTimeseriesData {
  id: number;
  lastUpdatedTime: Date;
  createdTime: Date;
  isString: boolean;
  isStep: boolean;
  description: string;
  name?: string;
  unit?: string;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  assetId?: number;
  dataSetId?: CogniteInternalId;
  securityCategories?: number[];
  latestDatapointDate?: Date;
  hasDatapoints?: Boolean;
}

export interface InternalTimeseriesDataWithMatchingLabels
  extends InternalTimeseriesData {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}

export interface InternalTimeseriesFilters extends InternalCommonFilters {
  isStep?: boolean;
  isString?: boolean;
  unit?: string | string[];
  metadata?: { key: string; value: string }[];
}

export interface OldTimeseriesFilters
  extends Omit<InternalTimeseriesFilters, 'metadata'> {
  metadata?: Metadata;
}
