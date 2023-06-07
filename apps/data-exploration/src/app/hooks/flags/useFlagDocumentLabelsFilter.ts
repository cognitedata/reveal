import { useFlag } from '@cognite/react-feature-flags';

/**
 * Flag used for enabling new labels filter to the documents.
 */
export const useFlagDocumentLabelsFilter = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_documents_labels_filter', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
