import { useFlag } from '@cognite/react-feature-flags';

import { getLanguage } from '..';

export const useLanguage = () => {
  const { isClientReady, isEnabled } = useFlag('FUSION_TRANSLATIONS', {
    forceRerender: true,
  });

  let data: string;
  if (isClientReady) {
    data = isEnabled ? getLanguage() : 'en';
  }

  return { isClientReady, data };
};
