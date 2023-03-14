/* eslint-disable  */

import { useTranslateProvider } from '../../environments/useTranslateProvider';

// Hook so we can use translate in our code
export const useTranslation = (namespace: string) => {
  // for fusion, we are going to use real translation provider
  // for mock, use dummy one
  const { t } = useTranslateProvider(namespace);

  return {
    t,
  };
};
