import { useFlag } from '../../environments/useFlag';

export const useTransformationsFeatureFlag = () => {
  const { isEnabled } = useFlag('DEVX_TRANSFORMATIONS_UI', {
    fallback: false,
  });

  return isEnabled;
};
