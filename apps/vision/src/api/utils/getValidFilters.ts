import { FileFilterProps } from '@cognite/sdk';
import { VisionFileFilterProps } from 'src/modules/FilterSidePanel/types';

/**
 * Pick only the valid properties from VisionFileFilters to get FileFilterProps
 * Filters for api requests like 'list' 'aggregate' should only contain FileFilterProps
 * @param {VisionFileFilterProps} visionFilter
 * @returns {FileFilterProps} validFilters
 */
export const getValidFilters = (
  visionFilter: VisionFileFilterProps
): FileFilterProps =>
  (({
    name,
    mimeType,
    metadata,
    assetIds,
    rootAssetIds,
    dataSetIds,
    assetSubtreeIds,
    directoryPrefix,
    source,
    createdTime,
    lastUpdatedTime,
    uploadedTime,
    sourceCreatedTime,
    sourceModifiedTime,
    externalIdPrefix,
    uploaded,
    labels,
    geoLocation,
  }) => ({
    name,
    mimeType,
    metadata,
    assetIds,
    rootAssetIds,
    dataSetIds,
    assetSubtreeIds,
    directoryPrefix,
    source,
    createdTime,
    lastUpdatedTime,
    uploadedTime,
    sourceCreatedTime,
    sourceModifiedTime,
    externalIdPrefix,
    uploaded,
    labels,
    geoLocation,
  }))(visionFilter);
