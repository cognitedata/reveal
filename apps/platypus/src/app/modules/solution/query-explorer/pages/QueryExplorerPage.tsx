import 'graphiql/graphiql.min.css';

import { BasicPlaceholder } from '../../../../components/BasicPlaceholder/BasicPlaceholder';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';
import { useDMContext } from '../../../../context/DMContext';
import { QueryExplorer } from '../components/QueryExplorer';

export const QueryExplorerPage = () => {
  const { selectedDataModel } = useDMContext();

  return (
    <PageContentLayout>
      <PageContentLayout.Body>
        {selectedDataModel.version ? (
          <QueryExplorer
            key={`${selectedDataModel.externalId}_${selectedDataModel.version}_${selectedDataModel.space}`}
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
