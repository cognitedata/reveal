import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../layouts/PageContentLayout';

export const PopulationPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Population pipelines" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        POPULATION PIPELINES (WIP...)
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
