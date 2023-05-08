import { useFlag as CogniteUseFlag } from '@cognite/react-feature-flags';

export const useFlag = (
  flag: Parameters<typeof CogniteUseFlag>[0],
  options: Parameters<typeof CogniteUseFlag>[1] & { fallbackForTest?: boolean }
) => CogniteUseFlag(flag, options);
