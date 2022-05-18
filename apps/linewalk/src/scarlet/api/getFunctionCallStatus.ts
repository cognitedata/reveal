import {
  CogniteClientPlayground,
  FunctionCall,
  FunctionCallStatus,
} from '@cognite/sdk-playground';

export const getFunctionCallStatus = async (
  client: CogniteClientPlayground,
  functionCall: FunctionCall
) => {
  const status: FunctionCallStatus | undefined = await client
    .get(
      `/api/playground/projects/p66-dev/functions/${functionCall.functionId}/calls/${functionCall.id}`
    )
    .then((response) => response.data?.status)
    .catch(() => undefined);
  return status;
};
