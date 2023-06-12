import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';

export const useBreadcrumb = () => {
  const { toClassifier } = useNavigation();

  const classifierPageBreadcrumbs = (classifierName: string) => [
    {
      title: classifierName,
      onClick: () => toClassifier(),
    },
  ];

  const labelPageBreadcrumbs = (classifierName: string, labelName: string) => [
    ...classifierPageBreadcrumbs(classifierName),
    { title: labelName },
  ];

  return {
    classifierPageBreadcrumbs,
    labelPageBreadcrumbs,
  };
};
