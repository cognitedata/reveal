/*!
 * Copyright 2024 Cognite AS
 */
import { type AnnotationsAssetRef, type CogniteClient, type IdEither } from '@cognite/sdk';
import { uniq } from 'lodash';
import { isDefined } from '../../utilities/isDefined';
import { type TaggedAddImage360CollectionOptions } from '../../components/Reveal3DResources/types';

export async function getImage360CollectionsForAsset(
  assetId: number,
  sdk: CogniteClient
): Promise<TaggedAddImage360CollectionOptions[]> {
  const fileRefsResult = await sdk.annotations.reverseLookup({
    filter: { annotatedResourceType: 'file', data: { assetRef: { id: assetId } } },
    limit: 1000
  });

  const idEithers = fileRefsResult.items.filter(isIdEither);

  if (idEithers.length === 0) {
    return [];
  }

  const fileInfos = await sdk.files.retrieve(idEithers, { ignoreUnknownIds: true });

  const siteIds = uniq(fileInfos.map((fileInfo) => fileInfo?.metadata?.site_id)).filter(isDefined);

  return siteIds.map((siteId) => ({ type: 'image360', addOptions: { siteId } }));
}

function isIdEither(ref: AnnotationsAssetRef): ref is IdEither {
  return ref.externalId !== undefined || ref.id !== undefined;
}
