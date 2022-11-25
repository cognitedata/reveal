import { CogniteClient } from '@cognite/sdk/dist/src';
import { TaggedAnnotation } from '../modules/workflows';
import getAssetIdsFromTaggedAnnotations from './getAssetIdsFromTaggedAnnotations';

export const linkFileToAssetIds = async (
  client: CogniteClient,
  annotations: TaggedAnnotation[]
) => {
  // Inlined and extended from:
  // https://github.com/cognitedata/cognite-annotations/blob/0d22f229a3e5caac92916abc6f0450135e00de43/typescript/src/ContextAnnotationUtils.ts#L28-L31

  // update file
  const updates = getAssetIdsFromTaggedAnnotations(annotations);

  if (updates.length > 0) {
    const updatedFile = await client.files.update(
      updates.map((update) => ({
        ...(update.id
          ? { id: update.id! }
          : { externalId: update.externalId! }),
        update: {
          assetIds: {
            add: Array.from(update.assetIds),
          },
        },
      }))
    );
    return updatedFile;
  }
};

export default linkFileToAssetIds;
