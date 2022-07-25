import { CogniteClient, FileInfo } from '@cognite/sdk';

export const fetchFileByExternalId = async (
  client: CogniteClient,
  externalId: string
): Promise<[FileInfo, File]> => {
  const cdfFile = (await client.files.retrieve([{ externalId }]))[0];
  const fileUrls = await client.files.getDownloadUrls([{ externalId }]);
  const response = await fetch(fileUrls[0].downloadUrl);
  if (response.ok) {
    const blob = await response.blob();
    const file = new File([blob], externalId);
    return [cdfFile, file];
  }
  throw Error(`Failed loading diagram ${externalId}`);
};
