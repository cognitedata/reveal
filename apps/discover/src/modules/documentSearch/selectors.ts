import { useMemo } from 'react';

import { TableResults } from 'components/tablev2/types';
import useSelector from 'hooks/useSelector';

export const useDocuments = () => {
  return useSelector((state) => state.documentSearch);
};

export const useCurrentDocumentQuery = () => {
  return useDocuments().currentDocumentQuery;
};

export const useFacets = () => {
  const state = useDocuments();
  return useMemo(() => state.result.facets, [state.result]);
};

export const useViewMode = () => {
  return useDocuments().viewMode;
};
export const useLabels = () => {
  return useDocuments().labels;
};

export const useDocumentResultHits = () => {
  const state = useDocuments();
  return useMemo(() => state.result.hits, [state.result]);
};

export const useDocumentResultCount = () => {
  const state = useDocuments();
  return useMemo(() => state.result.count, [state.result]);
};

export const useDocumentResult = (id: string) => {
  return useDocumentResultHits().find((doc) => doc.id === id);
};

export const usePreviewedDocuments = () => {
  const state = useDocuments();
  return useMemo(() => state.previewedEntities, [state.previewedEntities]);
};

export const usePreviewedDocumentIds = () => {
  const state = useDocuments();
  return useMemo(() => {
    const previewedDocumentIds: TableResults = {};
    state.previewedEntities.forEach((previewedEntity) => {
      previewedDocumentIds[previewedEntity.id] = true;
    });
    return previewedDocumentIds;
  }, [state.previewedEntities]);
};

export const useSelectedDocumentIds = () => {
  const state = useDocuments();
  return useMemo(() => state.selectedDocumentIds, [state.selectedDocumentIds]);
};

export const useHoveredDocumentId = () => {
  const state = useDocuments();
  return useMemo(() => state.hoveredDocumentId, [state.hoveredDocumentId]);
};
