import { CogniteClientPlayground, FunctionCall } from '@cognite/sdk-playground';

export const getFunctionCallResponse = async (
  client: CogniteClientPlayground,
  functionCall: FunctionCall
) => {
  const response = await client.functions.calls.retrieveResponse(
    functionCall.functionId,
    functionCall.id
  );
  return response;
};
