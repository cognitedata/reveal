import 'graphiql/graphiql.min.css';

import { useTranslation } from '@platypus-app/hooks/useTranslation';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';

import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';

export const QueryExplorerPage = () => {
  const { t } = useTranslation('SolutionMonitoring');
  const { dataModel, selectedVersion } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const renderHeader = () => {
    return <PageToolbar title={t('query_explorer_title', 'Query explorer')} />;
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        {selectedVersion?.version ? (
          <QueryExplorer
            solutionId={dataModel?.id || ''}
            schemaVersion={selectedVersion.version}
          />
        ) : (
          <BasicPlaceholder
            type="Documents"
            title="Query explorer is not available due to a data model is not found. Please publish one."
            size={300}
          />
        )}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
