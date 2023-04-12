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

type GptCompletionResponse = {
  data: {
    choices: {
      message: {
        role: string;
        content: string;
        finishReason: string;
      };
    }[];
  };
};

export default async function gpt(request: GptRequest, sdk: any) {
  const url = `/api/v1/projects/${sdk.project}/context/gpt/chat/completions`;
  const response = (await sdk.post(url, {
    data: request,
    withCredentials: true,
  })) as GptCompletionResponse;

  return response.data.choices;
}
