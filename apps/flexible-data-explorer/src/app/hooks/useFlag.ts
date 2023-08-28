import { useFlag } from '@cognite/react-feature-flags';

export const useIsCogpilotEnabled = () => {
  const { isEnabled } = useFlag('FDX_AI_SEARCH', {
    fallback: false,
  });

  return isEnabled;
};
