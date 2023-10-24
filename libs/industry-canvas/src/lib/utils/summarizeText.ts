import { getLanguage } from '@cognite/cdf-i18n-utils';
import { CogniteClient } from '@cognite/sdk/dist/src/index';

import plainGptPrompt from './plainGptPrompt';

const LANGUAGE_NAMES_IN_ENGLISH = new Intl.DisplayNames('en', {
  type: 'language',
});
const DEFAULT_LANGUAGE_CODE = 'en';
const DEFAULT_LANGUAGE_NAME = 'English';

const summarizeText = async (
  sdk: CogniteClient,
  text: string,
  maxWords = 80
): Promise<string> => {
  const languageCode = getLanguage() ?? DEFAULT_LANGUAGE_CODE;
  const languageName =
    LANGUAGE_NAMES_IN_ENGLISH.of(languageCode) ?? DEFAULT_LANGUAGE_NAME;
  const prompt = `Summarize the following page in ${languageName}, max ${maxWords} words. The words of page might not be in the original order: ${text}`;
  return await plainGptPrompt(sdk, prompt);
};

export default summarizeText;
