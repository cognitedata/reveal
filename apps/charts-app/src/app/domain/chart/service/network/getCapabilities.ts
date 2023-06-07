import { CogniteCapability, CogniteClient } from '@cognite/sdk';

export const getCapabilities = async (sdk: CogniteClient) =>
  sdk.get<{ capabilities: CogniteCapability }>('/api/v1/token/inspect');
