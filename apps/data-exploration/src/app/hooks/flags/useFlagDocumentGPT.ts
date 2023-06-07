import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for enabling new labels filter to the documents.
 */
export const useFlagDocumentGPT = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_gpt_document', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
