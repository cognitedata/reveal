import { createAsyncThunk } from '@reduxjs/toolkit';

import type { CogniteClient } from '@cognite/sdk';

export const fetchGroups = createAsyncThunk(
  'group/fetchGroups',
  async (client: CogniteClient) =>
    (await client.groups.list()).map((group) => ({
      ...group,
      deletedTime: group.deletedTime?.getTime(),
    }))
);
