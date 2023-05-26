import { CogniteClient } from '@cognite/sdk/dist/src/index';

import plainGptPrompt from './plainGptPrompt';

const summarizeText = async (
  sdk: CogniteClient,
  text: string,
  maxWords = 80
): Promise<string> => {
  const prompt = `Summarize the following page, max ${maxWords} words. The words of page might not be in the original order: ${text}`;
  return await plainGptPrompt(sdk, prompt);
};

export default summarizeText;
