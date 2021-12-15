import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DataManagementPage = () => {
  const { t } = useTranslation('SolutionDataPreview');

  const renderHeader = () => {
    return (
      <PageToolbar title={t('data_management_title', 'Data management')} />
    );
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>DATA MANAGEMENT (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
