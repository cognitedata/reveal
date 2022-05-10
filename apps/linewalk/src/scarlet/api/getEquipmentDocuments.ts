import { CogniteClient, FileLink, InternalId } from '@cognite/sdk';
import { DataSetId, DocumentType, EquipmentDocument } from 'scarlet/types';

export const getEquipmentDocuments = async (
  client: CogniteClient,
  {
    unitId,
    equipmentId,
  }: {
    unitId: string;
    equipmentId: string;
  }
): Promise<EquipmentDocument[]> => {
  const filesResponse = await client.files.list({
    filter: {
      externalIdPrefix: `${unitId}_${equipmentId}`,
      uploaded: true,
      dataSetIds: [{ id: DataSetId.P66_EquipmentScans }],
    },
  });

  if (!filesResponse.items.length) return Promise.resolve([]);

  const downloadUrlsResponse = (await client.files.getDownloadUrls(
    filesResponse.items.map(({ id }) => ({ id }))
  )) as (FileLink & InternalId)[];

  const downloadUrlsDictionary = downloadUrlsResponse.reduce(
    (result, item) => ({
      ...result,
      [item.id]: item.downloadUrl,
    }),
    {} as Record<number, string>
  );

  const documents: EquipmentDocument[] = filesResponse.items
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
