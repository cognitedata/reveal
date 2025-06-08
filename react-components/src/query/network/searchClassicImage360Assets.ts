import { AddImage360Options } from '@cognite/reveal';
import { AddImage360CollectionOptions } from '../../components';
import { Asset, CogniteClient } from '@cognite/sdk';
import { getClassicAssetMapped360Annotations } from './getClassicAssetMapped360Annotations';
import { partition, take } from 'lodash';
import { matchAssetWithQuery } from '../../utilities/instances/matchAssetWithQuery';
import { is360ImageEventsAddOptions } from '../../components/Reveal3DResources/typeGuards';

export async function searchClassicImage360Assets(
  searchQuery: string,
  image360s: AddImage360CollectionOptions[],
  limit: number,
  sdk: CogniteClient
): Promise<Asset[]> {
  const [classicImage360s, dmImage360s] = partition(image360s, is360ImageEventsAddOptions);

  const siteIds = [
    ...classicImage360s.map((image360) => image360.siteId),
    ...dmImage360s.map((image360) => image360.externalId)
  ];

  const assetMappings = await getClassicAssetMapped360Annotations(siteIds, sdk, {
    status: 'all'
  });

  if (searchQuery === '') {
    return take(assetMappings, limit).map((mapping) => mapping.asset);
  }

  const filteredAssets = assetMappings
    .map((mapping) => mapping.asset)
    .filter((asset) => matchAssetWithQuery(asset, searchQuery));

  return take(filteredAssets, limit);
}
