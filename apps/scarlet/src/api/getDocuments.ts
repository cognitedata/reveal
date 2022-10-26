import { CogniteClient, ListResponse, FileInfo } from '@cognite/sdk';
import { DataSetId, Facility } from 'types';

export const getDocuments = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: {
    facility: Facility;
    unitId: string;
    equipmentId?: string;
  }
): Promise<ListResponse<FileInfo[]>> => {
  const externalIdPrefix = [facility.name, unitId, equipmentId]
    .filter(Boolean)
    .join('_');
  const resp = await client.files.list({
    filter: {
      externalIdPrefix,
      uploaded: true,
      dataSetIds: [{ id: DataSetId.P66_EquipmentScans }],
    },
  });

  return resp;
};
