import { CogniteClient, FilesSearchFilter } from '@cognite/sdk';

export const searchFiles = (req: FilesSearchFilter, sdk: CogniteClient) => {
  return sdk.files.search(req);
};
