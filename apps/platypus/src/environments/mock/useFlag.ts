/* eslint-disable  */

export const useFlag = (
  flagName: string,
  {
    fallback,
    fallbackForTest,
  }: { fallback?: boolean; fallbackForTest?: boolean }
) => {
  const flagValue = fallbackForTest ?? fallback;
  return {
    isClientReady: true,
    isEnabled: flagValue,
  };
};
