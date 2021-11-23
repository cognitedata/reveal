import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const DeploymentsPage = () => {
  const { t } = useTranslation('SolutionDeployments');
  return (
    <PageLayout>
      <PageContentLayout>
        <PageContentLayout.Body>
          {t('deployments_title', 'DEPLOYMENTS')}
        </PageContentLayout.Body>
      </PageContentLayout>
    </PageLayout>
  );
};
