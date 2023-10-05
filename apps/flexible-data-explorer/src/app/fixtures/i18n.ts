import { TOptions } from 'i18next';

import english from '../../i18n/en/flexible-data-explorer.json';
import { TFunction } from '../hooks/useTranslation';

export const mockTFunction: TFunction = (
  key: keyof typeof english,
  options: TOptions = {}
) => {
  let string = english[key];

  switch (options.postProcess) {
    case 'lowercase':
      string = string.toLowerCase();
  }

  return string;
};
