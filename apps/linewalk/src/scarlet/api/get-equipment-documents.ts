import { CogniteClient, FileLink, InternalId } from '@cognite/sdk';
import { DataSetId, DocumentType, ScarletDocument } from 'scarlet/types';

export const getEquipmentDocuments = async (
  client: CogniteClient,
  {
    unitName,
    equipmentName,
  }: {
    unitName: string;
    equipmentName: string;
  }
): Promise<ScarletDocument[]> => {
  const filesResponse = await client.files.list({
    filter: {
      externalIdPrefix: `${unitName}_${equipmentName}`,
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

  const documents: ScarletDocument[] = filesResponse.items.map((item) => ({
    ...item,
    downloadUrl: downloadUrlsDictionary[item.id],
  }));

  return (
    documents
      .filter((document) => document.downloadUrl)
      // .filter((a) => a.metadata?.document_type === DocumentType.U1)
      .sort((a) => (a.metadata?.document_type === DocumentType.U1 ? -1 : 0))
  );
};
