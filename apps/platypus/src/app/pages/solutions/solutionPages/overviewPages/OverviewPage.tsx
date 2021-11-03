import { Button } from '@cognite/cogs.js';
import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../layouts/PageContentLayout';

export const OverviewPage = () => {
  const renderHeader = () => {
    return (
      <PageToolbar title="Overview" backPathname="/">
        <Button
          onClick={() => {
            alert('For demo purposes only.');
          }}
        >
          Demo
        </Button>
      </PageToolbar>
    );
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>OVERVIEW (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
