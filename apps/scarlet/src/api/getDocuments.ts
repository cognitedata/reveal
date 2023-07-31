import { CogniteClient, ListResponse, FileInfo } from '@cognite/sdk';
import { datasetByProject } from 'config';
import { Facility } from 'types';

export const getDocuments = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    prefix,
  }: {
    facility: Facility;
    unitId: string;
    prefix?: string;
  }
): Promise<ListResponse<FileInfo[]>> => {
  const dataSet = datasetByProject(client.project);
  const externalIdPrefix = [facility.name, unitId, prefix]
    .filter(Boolean)
    .join('_');
  const resp = await client.files.list({
    filter: {
      externalIdPrefix,
      uploaded: true,
      dataSetIds: [{ id: dataSet.P66_U1Forms }],
    },
  });

  return resp;
};
