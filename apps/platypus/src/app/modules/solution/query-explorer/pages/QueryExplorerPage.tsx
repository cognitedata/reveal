import 'graphiql/graphiql.min.css';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
}

export const QueryExplorerPage = ({
  dataModelExternalId,
}: QueryExplorerPageProps) => {
  const { t } = useTranslation('SolutionMonitoring');
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );

  const renderHeader = () => {
    return <PageToolbar title={t('query_explorer_title', 'Query explorer')} />;
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        {selectedDataModelVersion.version ? (
          <QueryExplorer
            solutionId={dataModelExternalId}
            schemaVersion={selectedDataModelVersion.version}
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
