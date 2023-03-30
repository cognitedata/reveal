import { lazy, Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPage } from '../data-model/pages/elements';
import { useDataModelVersions } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelVersion } from '@platypus/platypus-core';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { Flex } from '@cognite/cogs.js';
import { DOCS_LINKS } from '@platypus-app/constants';
import { useDraftRows } from './hooks/useDraftRows';
import { useNavigate } from '@platypus-app/flags/useNavigate';

type TabType = 'preview' | 'pipelines' | 'data-quality';

const PreviewPage = lazy<any>(() =>
  import('./pages/Preview').then((module) => ({
    default: module.Preview,
  }))
);

export interface DataManagementPageProps {
  dataModelExternalId: string;
  space: string;
}

export const DataManagementPage = ({
  dataModelExternalId,
  space,
}: DataManagementPageProps) => {
  const { t } = useTranslation('SolutionDataPreview');

  const { subSolutionPage, version } = useParams() as {
    subSolutionPage: string;
    version: string;
  };

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab] = useState<TabType>(initialPage);

  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );

  const navigate = useNavigate();

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const selectedTypeName = useSelector<string>(
    (state) => state.dataManagement.selectedType?.name || ''
  );

  const { clearState } = useDraftRows();

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    navigate(
      `/${dataModelVersion.space}/${dataModelExternalId}/${dataModelVersion.version}/data-management/preview?type=${selectedTypeName}`
    );
    clearState();
  };

  const Preview = (
    <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PreviewPage dataModelExternalId={dataModelExternalId} space={space} />
      </Suspense>
    </StyledPage>
  );

  return (
    <PageContentLayout>
      <PageContentLayout.Header>
        <VersionSelectorToolbar
          title={t('data_management_title', 'Data management')}
          schemas={dataModelVersions || []}
          onDataModelVersionSelect={handleDataModelVersionSelect}
          selectedDataModelVersion={selectedDataModelVersion}
        >
          <Flex justifyContent="space-between">
            <DocLinkButtonGroup docsLinkUrl={DOCS_LINKS.POPULATION} />
          </Flex>
        </VersionSelectorToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body>{Preview}</PageContentLayout.Body>
    </PageContentLayout>
  );
};
