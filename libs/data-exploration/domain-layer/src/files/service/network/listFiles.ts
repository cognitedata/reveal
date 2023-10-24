import { CogniteClient, FileRequestFilter } from '@cognite/sdk';

export const listFiles = (filter: FileRequestFilter, sdk: CogniteClient) => {
  return sdk.files.list(filter);
};
