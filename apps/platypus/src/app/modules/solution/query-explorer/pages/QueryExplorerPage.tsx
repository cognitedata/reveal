import 'graphiql/graphiql.min.css';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModelVersion } from '@platypus/platypus-core';
import { useHistory } from 'react-router-dom';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { Flex } from '@cognite/cogs.js';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { DOCS_LINKS } from '@platypus-app/constants';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
}

export const QueryExplorerPage = ({
  dataModelExternalId,
}: QueryExplorerPageProps) => {
  const { t } = useTranslation('SolutionMonitoring');
  const history = useHistory();
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const { data: dataModel } = useDataModel(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    history.replace(
      `/data-models/${dataModel?.space}/${dataModelExternalId}/${dataModelVersion.version}/data/query-explorer`
    );
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>
        <VersionSelectorToolbar
          title={t('query_explorer_title', 'Query explorer')}
          schemas={dataModelVersions || []}
          draftSaved={false}
          onDataModelVersionSelect={handleDataModelVersionSelect}
          selectedDataModelVersion={selectedDataModelVersion}
        >
          <Flex justifyContent="space-between">
            <DocLinkButtonGroup docsLinkUrl={DOCS_LINKS.QUERYING} />
          </Flex>
        </VersionSelectorToolbar>
      </PageContentLayout.Header>
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
