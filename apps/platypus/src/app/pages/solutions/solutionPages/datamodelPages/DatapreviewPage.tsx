import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../layouts/PageContentLayout';

export const DatapreviewPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Data preview" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>DATA PREVIEW (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
