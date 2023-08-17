import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for developing the  Contextualization Score header
 */
export const useFlagContextualizationScoreHeader = () => {
  const { isEnabled } = useFlag('MATCHMAKERS_contextualization_score_header', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
