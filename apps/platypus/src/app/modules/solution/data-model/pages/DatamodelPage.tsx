import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DatamodelPage = () => {
  const { t } = useTranslation('SolutionDataModel');
  const renderHeader = () => {
    return <PageToolbar title={t('data_model_title', 'Data model')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>Data model page</PageContentLayout.Body>
    </PageContentLayout>
  );
};
