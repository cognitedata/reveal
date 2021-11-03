import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../layouts/PageContentLayout';

export const DatamodelPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Data model" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>DATA MODEL (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
