import { CogniteClient, FileLink, InternalId } from '@cognite/sdk';
import { DocumentType, EquipmentDocument, Facility } from 'types';

import { getDocuments } from './getDocuments';

export const getUnitDocuments = async (
  client: CogniteClient,
  {
    facility,
    unitId,
  }: {
    facility: Facility;
    unitId: string;
  }
): Promise<EquipmentDocument[]> => {
  const documentsResp = await getDocuments(client, {
    facility,
    unitId,
  });

  if (!documentsResp.items.length) return Promise.resolve([]);

  const downloadUrlsResponse = (await client.files.getDownloadUrls(
    documentsResp.items.map(({ id }) => ({ id }))
  )) as (FileLink & InternalId)[];

  const downloadUrlsDictionary = downloadUrlsResponse.reduce(
    (result, item) => ({
      ...result,
      [item.id]: item.downloadUrl,
    }),
    {} as Record<number, string>
  );

  const documents: EquipmentDocument[] = documentsResp.items
    .map((item) => ({
      id: item.id,
      metadata: item.metadata,
      externalId: item.externalId,
      downloadUrl: downloadUrlsDictionary[item.id],
      type: item.metadata?.document_type,
      uploadedTime: item.uploadedTime,
    }))
    .filter((document) => document.downloadUrl)
    .sort((document) => (document.type === DocumentType.U1 ? -1 : 0));

  return documents;
};
