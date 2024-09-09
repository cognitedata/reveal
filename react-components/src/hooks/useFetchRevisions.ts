/*!
 * Copyright 2024 Cognite AS
 */
import { type Model3D, type CogniteClient, type Revision3D } from '@cognite/sdk';
import { type ModelWithRevision } from './types';

export const useFetchRevisions = async (
  model: Model3D | undefined,
  sdk: CogniteClient
): Promise<ModelWithRevision | undefined> => {
  if (model === undefined) return;
  const revisions = await sdk.revisions3D.list(model.id).autoPagingToArray({ limit: Infinity });
  const revisionFound =
    revisions.find((revision: Revision3D) => revision.published) ?? revisions[0];
  return {
    model,
    revision: revisionFound
  };
};
