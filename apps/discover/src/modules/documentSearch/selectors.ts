import { useMemo } from 'react';

import useSelector from 'hooks/useSelector';

export const useDocuments = () => {
  return useSelector((state) => state.documentSearch);
};

export const useSelectedDocumentIds = () => {
  const state = useDocuments();
  return useMemo(() => state.selectedDocumentIds, [state.selectedDocumentIds]);
};

export const useExtractParentFolderPath = () => {
  const state = useDocuments();
  return useMemo(
    () => state.extractParentFolderPath,
    [state.extractParentFolderPath]
  );
};
