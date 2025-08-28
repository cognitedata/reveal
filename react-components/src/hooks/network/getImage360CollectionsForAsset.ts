import { type AnnotationsAssetRef, type IdEither } from '@cognite/sdk';
import { uniq } from 'lodash';
import { isDefined } from '../../utilities/isDefined';
import { type TaggedAddImage360CollectionOptions } from '../../components/Reveal3DResources/types';
import { type ModelsForAssetParams } from './types';
import { isIdEither } from '../../utilities/instanceIds';

export async function getImage360CollectionsForAsset({
  assetId,
  sdk
}: ModelsForAssetParams): Promise<TaggedAddImage360CollectionOptions[]> {
  const fileRefsResult = await sdk.annotations.reverseLookup({
    filter: {
      annotatedResourceType: 'file',
      annotationType: 'images.AssetLink',
      data: { assetRef: { id: assetId } }
    },
    limit: 1000
  });

  const idEithers = fileRefsResult.items.filter(isIdEither);

  if (idEithers.length === 0) {
    return [];
  }

  const fileInfos = await sdk.files.retrieve(idEithers, { ignoreUnknownIds: true });

  const siteIds = uniq(fileInfos.map((fileInfo) => fileInfo?.metadata?.site_id)).filter(isDefined);

  return siteIds.map((siteId) => ({
    type: 'image360',
    addOptions: { source: 'events', siteId }
  }));
}
