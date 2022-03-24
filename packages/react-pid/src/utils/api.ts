import { CogniteClient } from '@cognite/sdk';

export const fetchFileByExternalId = async (
  client: CogniteClient,
  externalId: string
) => {
  const fileUrls = await client.files.getDownloadUrls([{ externalId }]);
  const response = await fetch(fileUrls[0].downloadUrl);
  if (response.ok) {
    const blob = await response.blob();
    const file = new File([blob], externalId);
    return file;
  }
  throw Error(`Failed loading diagram ${externalId}`);
};
