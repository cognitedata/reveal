import { useNavigation } from 'hooks/useNavigation';

export const useBreadcrumb = () => {
  const { toClassifier, toLabels } = useNavigation();

  const classifierPageBreadcrumbs = () => [
    // Hard coding of the 'Document Type' is bad,
    // fix this in the future when pipeline supports multiple classifier names
    { title: 'New classifier', onClick: () => toClassifier('Document Type') },
  ];

  const labelsPageBreadcrumbs = () => [
    ...classifierPageBreadcrumbs(),
    { title: 'Labels', onClick: () => toLabels() },
  ];

  const labelPageBreadcrumbs = (labelName: string) => [
    ...labelsPageBreadcrumbs(),
    { title: labelName },
  ];

  return {
    classifierPageBreadcrumbs,
    labelsPageBreadcrumbs,
    labelPageBreadcrumbs,
  };
};
