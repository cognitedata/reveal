import { CogniteClient, FileLink, InternalId } from '@cognite/sdk';
import { DocumentType, EquipmentDocument, Facility } from 'types';

import { getDocuments } from './getDocuments';

export const getEquipmentDocuments = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: {
    facility: Facility;
    unitId: string;
    equipmentId: string;
  }
): Promise<EquipmentDocument[]> => {
  const documentsResp = await getDocuments(client, {
    facility,
    unitId,
    prefix: `${equipmentId}_U1`,
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
      externalId: item.externalId,
      downloadUrl: downloadUrlsDictionary[item.id],
      type: item.metadata?.document_type,
    }))
    .filter((document) => document.downloadUrl)
    .sort((document) => (document.type === DocumentType.U1 ? -1 : 0));

  return documents;
};
