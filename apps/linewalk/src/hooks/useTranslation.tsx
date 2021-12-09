/* eslint-disable  */
export const useTranslation = (namespace: string) => {
  const translate = (key: string, referenceValue: string, options = {}) => {
    return referenceValue;
  };

  return {
    t: translate,
  };
};
