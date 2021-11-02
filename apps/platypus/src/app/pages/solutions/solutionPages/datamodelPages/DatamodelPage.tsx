import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const DatamodelPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Data model" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>DATAMODEL PAGE is coming soon...</div>
    </PageWithHeaderLayout>
  );
};
