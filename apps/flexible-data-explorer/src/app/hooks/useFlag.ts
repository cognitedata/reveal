import { useFlag } from '@cognite/react-feature-flags';

export const useIsCopilotEnabled = () => {
  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
  });

  return isEnabled;
};
