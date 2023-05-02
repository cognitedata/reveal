import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
interface DataQualityPageProps {
  dataModelExternalId: string;
  space: string;
}

export const DataQualityPage = ({
  dataModelExternalId,
  space,
}: DataQualityPageProps) => {
  const { t } = useTranslation('DataQualityPage');

  return (
    <PageContentLayout>
      <PageContentLayout.Header data-cy="dq-page-header">
        <PageToolbar title={t('data_quality_title', 'Data quality')} />
        {/*TODO: Add here buttons */}
      </PageContentLayout.Header>

      <PageContentLayout.Body data-cy="dq-page-content">
        {/*TODO: Add here the content of the page */}
        {dataModelExternalId}-{space}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
