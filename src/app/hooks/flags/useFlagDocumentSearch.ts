import { useFlag } from '@cognite/react-feature-flags';

export const useFlagDocumentSearch = () => {
  const { isEnabled } = useFlag('DATA_EXPLORATION_document_search', {
    forceRerender: true,
    fallback: false,
  });

  return isEnabled;
};
