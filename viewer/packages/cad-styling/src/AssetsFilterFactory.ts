/*!
 * Copyright 2022 Cognite AS
 */
import { Asset } from '@cognite/sdk';
import { AssetsFilter } from './AssetNodeCollection';

/**
 * Helper class for creating {@link AssetsFilter} for use with {@link AssetNodeCollection}.
 */

export class AssetsFilterFactory {
  /**
   * Creates a filter that only accepts assets that have at least one of the provided labels. Labels are case-sensitive.
   *
   * @see {@link https://docs.cognite.com/api/v1/#tag/Assets | Assets API} for more information about Asset labels.
   * @param acceptedLabels A non-empty set of accepted labels. If empty, no assets will be accepted.
   * @returns A filter for use with {@link AssetNodeCollection}.
   */
  static createAssetHasOneOfLabelsFilter(acceptedLabels: string[]): AssetsFilter {
    const validLabels = new Set(acceptedLabels);
    const hasAtLeastOneLabel = (asset: Asset) =>
      asset.labels !== undefined && asset.labels.find(label => validLabels.has(label.externalId)) !== undefined;

    const filter: AssetsFilter = (candidates: Asset[]) => {
      return Promise.resolve(candidates.filter(asset => hasAtLeastOneLabel(asset)));
    };
    return filter;
  }
}
