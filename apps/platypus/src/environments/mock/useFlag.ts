/* eslint-disable  */

export const useFlag = (
  flagName: string,
  { fallback }: { fallback?: boolean }
) => {
  return {
    isClientReady: true,
    isEnabled: fallback,
  };
};
