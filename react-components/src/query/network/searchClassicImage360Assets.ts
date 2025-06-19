import { type AddImage360CollectionOptions } from '../../components';
import { type Asset, type CogniteClient } from '@cognite/sdk';
import { getClassicAssetMapped360Annotations } from './getClassicAssetMapped360Annotations';
import { partition, take } from 'lodash';
import { is360ImageEventsAddOptions } from '../../components/Reveal3DResources/typeGuards';
import { type AllAssetFilterProps } from './filters';

export async function searchClassicImage360Assets(
  image360s: AddImage360CollectionOptions[],
  assetFilters: AllAssetFilterProps | undefined,
  limit: number,
  sdk: CogniteClient
): Promise<Asset[]> {
  const [classicImage360s, dmImage360s] = partition(image360s, is360ImageEventsAddOptions);

  const siteIds = [
    ...classicImage360s.map((image360) => image360.siteId),
    ...dmImage360s.map((image360) => image360.externalId)
  ];

  const assetMappings = await getClassicAssetMapped360Annotations(
    siteIds,
    {
      assetFilters,
      image360AnnotationFilterOptions: {
        status: 'approved'
      }
    },
    sdk
  );

  return take(assetMappings, limit).map((mapping) => mapping.asset);
}
