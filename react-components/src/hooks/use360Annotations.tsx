/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type AnnotationsBoundingVolume } from '@cognite/sdk';
import { uniqBy } from 'lodash';
import { type AugmentedMapping } from './types';
import { get360Annotations } from './get360Annotations';
import { getAssets } from './getAssets';
import { useEffect, useState } from 'react';

export const use360Annotations = (sdk: CogniteClient, siteIds: string[]): AugmentedMapping[] => {
  const [mappings, setMappings] = useState<AugmentedMapping[]>([]);
  const [annotationMapping, setAnnotationMapping] = useState<
    Array<{
      annotationId: number;
      assetId: number;
    }>
  >([]);
  const [uniqueAssets, setUniqueAssets] = useState<
    Array<{
      annotationId: number;
      assetId: number;
    }>
  >([]);

  const { data: image360Annotations } = get360Annotations(sdk, siteIds);
  const { data: assets } = getAssets(uniqueAssets, sdk);

  useEffect(() => {
    if (image360Annotations === undefined) {
      return;
    }
    const updatedAnnotationMapping = image360Annotations.map((annotation) => ({
      annotationId: annotation.id,
      assetId: (annotation.data as AnnotationsBoundingVolume).assetRef?.id as number
    }));

    const updatedUniqueAssets = uniqBy(updatedAnnotationMapping, 'assetId');
    setAnnotationMapping(updatedAnnotationMapping);
    setUniqueAssets(updatedUniqueAssets);
  }, [image360Annotations]);

  useEffect(() => {
    if (assets === undefined) {
      return;
    }
    const updatedMappings = annotationMapping
      .filter(({ assetId }) => assets[assetId])
      .map((mapping) => ({
        name: assets[mapping.assetId].name,
        description: assets[mapping.assetId].description,
        createTime: assets[mapping.assetId].createdTime,
        lastUpdatedTime: assets[mapping.assetId].lastUpdatedTime,
        ...mapping
      }));
    setMappings(updatedMappings);
  }, [assets]);

  return mappings;
};
