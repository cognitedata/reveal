import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DatapreviewPage = () => {
  const { t } = useTranslation('SolutionDataPreview');

  const renderHeader = () => {
    return <PageToolbar title={t('data_preview_title', 'Data preview')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>DATA PREVIEW (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
