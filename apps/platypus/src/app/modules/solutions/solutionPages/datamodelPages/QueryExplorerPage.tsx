import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';

export const QueryExplorerPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Query explorer" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>QUERY EXPLORER (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
