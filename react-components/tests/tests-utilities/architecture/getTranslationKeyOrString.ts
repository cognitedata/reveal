import { TranslationInput } from '../../../src/architecture';
import { isTranslatedString } from '../../../src/architecture/base/utilities/TranslateInput';

export function getTranslationKeyOrString(input: TranslationInput | undefined): string {
  if (input === undefined) {
    throw Error('Expected input to be defined');
  }

  if (isTranslatedString(input)) {
    return input.key;
  } else {
    return input.untranslated;
  }
}
