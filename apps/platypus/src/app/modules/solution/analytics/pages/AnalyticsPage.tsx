import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Solution } from '@platypus/platypus-core';

export const AnalyticsPage = ({ solution }: { solution?: Solution }) => {
  const { t } = useTranslation('SolutionAnalytics');
  const renderHeader = () => {
    return <PageToolbar title={t('analytics_title', 'Analytics')} />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        ANALYTICS (WIP...) <br />
        <strong>{solution?.name}</strong>
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
