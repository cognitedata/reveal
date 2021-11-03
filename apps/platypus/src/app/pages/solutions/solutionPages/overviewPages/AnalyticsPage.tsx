import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../layouts/PageContentLayout';

export const AnalyticsPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Analytics" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>ANALYTICS (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
