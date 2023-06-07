/* eslint-disable  */

export const useFlag = (
  flagName: string,
  { fallbackForTest }: { fallbackForTest?: boolean }
) => {
  return {
    isClientReady: true,
    isEnabled: fallbackForTest,
  };
};
