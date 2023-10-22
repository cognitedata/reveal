import { CogniteClient } from '@cognite/sdk';

type GptMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

type GptRequest = {
  messages: GptMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

type GptMessageResult = {
  message: {
    role: string;
    content: string;
    finishReason: string;
  };
};

type GptCompletionResponse = {
  data: {
    choices: GptMessageResult[];
  };
};

export const getChatCompletions = async (
  request: GptRequest,
  sdk: CogniteClient
): Promise<GptMessageResult[]> => {
  const url = `/api/v1/projects/${sdk.project}/gpt/chat/completions`;
  const response = (await sdk.post(url, {
    data: request,
    withCredentials: true,
  })) as GptCompletionResponse;

  return response.data.choices;
};
