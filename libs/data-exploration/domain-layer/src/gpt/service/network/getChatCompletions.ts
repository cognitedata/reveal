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
  model?: string;
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
    data: { ...request, model: 'gpt-35-turbo-16k' },
    withCredentials: true,
  })) as GptCompletionResponse;

  return response.data.choices;
};
