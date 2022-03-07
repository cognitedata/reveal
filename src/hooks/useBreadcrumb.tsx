import { useNavigation } from 'hooks/useNavigation';

export const useBreadcrumb = () => {
  const { toClassifier, toLabels } = useNavigation();

  const classifierPageBreadcrumbs = (classifierName?: string) => [
    {
      title: classifierName ?? 'Classifier',
      onClick: () => toClassifier(classifierName),
    },
  ];

  const labelsPageBreadcrumbs = (classifierName?: string) => [
    ...classifierPageBreadcrumbs(classifierName),
    { title: 'Labels', onClick: () => toLabels() },
  ];

  const labelPageBreadcrumbs = (labelName: string, classifierName?: string) => [
    ...classifierPageBreadcrumbs(classifierName),
    { title: labelName },
  ];

  return {
    classifierPageBreadcrumbs,
    labelsPageBreadcrumbs,
    labelPageBreadcrumbs,
  };
};
