import { CogniteClient, FileFilterProps, IdEither } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

interface FilteredClient {
  client: CogniteClient;
  filter: FileFilterProps;
}
interface ClientFilteredByIds {
  client: CogniteClient;
  externalIds: IdEither[];
}

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async ({ client, filter }: FilteredClient) =>
    (
      await client.files.list({
        filter,
      })
    ).items.map((file) => ({
      ...file,
      createdTime: file.createdTime?.getTime(),
      lastUpdatedTime: file.lastUpdatedTime?.getTime(),
      uploadedTime: file.uploadedTime?.getTime(),
    }))
);

export const fetchDownloadLinks = createAsyncThunk(
  'files/fetchDownloadLinks',
  async ({ client, externalIds }: ClientFilteredByIds) =>
    client.files.getDownloadUrls(externalIds)
);
