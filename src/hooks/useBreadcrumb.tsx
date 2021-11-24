import { useNavigation } from 'hooks/useNavigation';

export const useBreadcrumb = () => {
  const { goBack } = useNavigation();

  const classifierPageBreadcrumbs = () => [
    { title: 'New classifier', onClick: () => goBack() },
  ];

  const labelPageBreadcrumbs = (labelName: string) => [
    ...classifierPageBreadcrumbs(),
    { title: labelName, onClick: () => goBack() },
  ];

  return {
    classifierPageBreadcrumbs,
    labelPageBreadcrumbs,
  };
};
