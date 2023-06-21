import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

// hook used in components to get the translation function
export const useTranslation = () => {
  const { t } = useTypedTranslation();

  return {
    t,
  };
};
