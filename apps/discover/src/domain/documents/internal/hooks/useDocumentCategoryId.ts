import { useQueryDocumentLabels } from 'domain/documents/service/queries/useDocumentQuery';

export const useDocumentCategoryId = (categoryName?: string) => {
  const { data: allLabels, isFetched } = useQueryDocumentLabels();
  if (!isFetched || !categoryName) {
    return '';
  }
  const matchingLabel = allLabels.find(
    (label) => label.name === categoryName
  )?.id;

  return matchingLabel || '';
};
