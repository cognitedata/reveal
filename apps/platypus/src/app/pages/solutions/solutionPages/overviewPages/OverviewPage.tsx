import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';

export const OverviewPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Overview" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>OVERVIEW (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
