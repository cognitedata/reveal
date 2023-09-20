import { TOptions } from 'i18next';

import english from '../../i18n/en/flexible-data-explorer.json';
import { TFunction } from '../hooks/useTranslation';

export const mockTFunction: TFunction = (
  key: keyof typeof english,
  _options: TOptions = {}
) => {
  return english[key];
};
