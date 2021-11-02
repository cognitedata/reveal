import { Toolbar } from '../../../../components/Toolbar/Toolbar';
import { PageWithHeaderLayout } from '../../../layouts/PageWithHeaderLayout';

export const QueryExplorerPage = () => {
  const renderHeader = () => {
    return <Toolbar title="Query explorer" />;
  };
  return (
    <PageWithHeaderLayout header={renderHeader()}>
      <div>QUERY EXPLORER (WIP...)</div>
    </PageWithHeaderLayout>
  );
};
