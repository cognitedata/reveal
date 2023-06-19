import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

// Hook so we can use translate in our code
export const useTranslation = () => {
  const { t } = useTypedTranslation();

  return {
    t,
  };
};
