import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const UpdatesPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Updates" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>UPDATES PAGE is coming soon...</div>
    </PageWithHeaderLayout>
  );
};
