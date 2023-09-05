import { useCallback } from 'react';

import { TOptions } from 'i18next';

// ENGLISH is the default language and source of truth.
import { translateForCopilot, copilotTranslations } from '@cognite/llm-hub';

export const useTranslation = () => {
  const translate = useCallback(
    (
      key: keyof (typeof copilotTranslations)['en']['copilot-core'],
      options: TOptions = {}
    ) => {
      return translateForCopilot(key, {
        defaultValue: copilotTranslations['en']['copilot-core'][key],
        ...options,
      });
    },
    []
  );

  return {
    t: translate,
  };
};
