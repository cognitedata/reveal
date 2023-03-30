import 'graphiql/graphiql.min.css';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { useDataModelVersions } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { DataModelVersion } from '@platypus/platypus-core';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { Flex } from '@cognite/cogs.js';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { DOCS_LINKS } from '@platypus-app/constants';
import { useNavigate } from '@platypus-app/flags/useNavigate';
import { useParams } from 'react-router-dom';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
  space: string;
}

export const QueryExplorerPage = ({
  dataModelExternalId,
  space,
}: QueryExplorerPageProps) => {
  const { t } = useTranslation('SolutionMonitoring');
  const navigate = useNavigate();
  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );
  const { version } = useParams() as { version: string };

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    navigate(
      `/${space}/${dataModelExternalId}/${dataModelVersion.version}/query-explorer`,
      { replace: true }
    );
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>
        <VersionSelectorToolbar
          title={t('query_explorer_title', 'Query explorer')}
          schemas={dataModelVersions || []}
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
