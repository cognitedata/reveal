/* eslint-disable  */

// Dummy hook so we can use translate in our code
// We will switch later to the react package
export const useTranslation = (namespace: string) => {
  const translate = (key: string, referenceValue: string, options = {}) => {
    return referenceValue;
  };

  return {
    t: translate,
  };
};
