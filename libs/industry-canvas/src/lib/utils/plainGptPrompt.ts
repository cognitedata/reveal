import { CogniteClient } from '@cognite/sdk/dist/src/index';

import { getChatCompletions } from '@data-exploration-lib/domain-layer';

const plainGptPrompt = async (
  sdk: CogniteClient,
  prompt: string
): Promise<string> => {
  const choices = await getChatCompletions(
    {
      messages: [
        {
          role: 'system',
          content: 'You are an experienced industrial process engineer.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      maxTokens: 256,
    },
    sdk
  );

  return choices[0].message.content;
};

export default plainGptPrompt;
