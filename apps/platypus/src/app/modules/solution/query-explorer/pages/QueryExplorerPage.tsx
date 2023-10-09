import 'graphiql/graphiql.min.css';

import { useParams } from 'react-router-dom';

import { BasicPlaceholder } from '../../../../components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';
import { useSelectedDataModelVersion } from '../../../../hooks/useSelectedDataModelVersion';
import { QueryExplorer } from '../components/QueryExplorer';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
  space: string;
}

export const QueryExplorerPage = ({
  dataModelExternalId,
  space,
}: QueryExplorerPageProps) => {
  const { version } = useParams() as { version: string };

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  return (
    <PageContentLayout>
      <PageContentLayout.Body>
        {selectedDataModelVersion.version ? (
          <QueryExplorer
            key={`${dataModelExternalId}_${selectedDataModelVersion.version}_${space}`}
            dataModelExternalId={dataModelExternalId}
            space={space}
            schemaVersion={selectedDataModelVersion.version}
          />
        ) : (
          <BasicPlaceholder
            type="EmptyStateFolderSad"
            title="Query explorer is not available due to a data model is not found. Please publish one."
            size={300}
          />
        )}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
