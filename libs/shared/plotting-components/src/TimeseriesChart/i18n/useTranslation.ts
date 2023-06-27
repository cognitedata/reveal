import { useCallback } from 'react';

export type TFunction = (
  key: string,
  referenceValue: string,
  options?: {}
) => string;

export const useTranslation = () => {
  const translate: TFunction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (key: string, referenceValue: string, options?: {}) => {
      return referenceValue;
    },
    []
  );

  return {
    t: translate,
  };
};
