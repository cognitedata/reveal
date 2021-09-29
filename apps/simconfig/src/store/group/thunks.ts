import { CogniteClient } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGroups = createAsyncThunk(
  'group/fetchGroups',
  async (client: CogniteClient) =>
    (await client.groups.list()).map((group) => ({
      ...group,
      deletedTime: group.deletedTime?.getTime(),
    }))
);
