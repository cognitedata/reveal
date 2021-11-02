import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const DatapreviewPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Data preview" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>DATA PREVIEW PAGE is coming soon...</div>
    </PageWithHeaderLayout>
  );
};
