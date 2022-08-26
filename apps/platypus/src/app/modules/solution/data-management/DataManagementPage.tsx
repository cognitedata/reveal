import React, { lazy, Suspense, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPage } from '../data-model/pages/elements';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModelVersion } from '@platypus/platypus-core';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { Flex } from '@cognite/cogs.js';

type TabType = 'preview' | 'pipelines' | 'data-quality';

const PreviewPage = lazy<any>(() =>
  import('./pages/Preview').then((module) => ({
    default: module.Preview,
  }))
);

const PipelinesPage = lazy<any>(() =>
  import('./pages/Pipelines').then((module) => ({
    default: module.Pipelines,
  }))
);

const DataQualityPage = lazy<any>(() =>
  import('./pages/DataQuality').then((module) => ({
    default: module.DataQuality,
  }))
);

export interface DataManagementPageProps {
  dataModelExternalId: string;
}

export const DataManagementPage = ({
  dataModelExternalId,
}: DataManagementPageProps) => {
  const { t } = useTranslation('SolutionDataPreview');

  const { subSolutionPage } = useParams<{
    subSolutionPage: string;
  }>();

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab] = useState<TabType>(initialPage);

  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);

  const history = useHistory();

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    history.replace(
      `/data-models/${dataModelExternalId}/${dataModelVersion.version}/data/data-management/preview`
    );
  };

  const Preview = (
    <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PreviewPage dataModelExternalId={dataModelExternalId} />
      </Suspense>
    </StyledPage>
  );

  const Pipelines = (
    <StyledPage style={tab !== 'pipelines' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PipelinesPage />
      </Suspense>
    </StyledPage>
  );

  const DataQuality = (
    <StyledPage style={tab !== 'data-quality' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <DataQualityPage />
      </Suspense>
    </StyledPage>
  );

  return (
    <PageContentLayout>
      <PageContentLayout.Header>
        <VersionSelectorToolbar
          title={t('data_management_title', 'Data management')}
          schemas={dataModelVersions || []}
          draftSaved={false}
          onDataModelVersionSelect={handleDataModelVersionSelect}
          selectedDataModelVersion={selectedDataModelVersion}
        >
          <Flex justifyContent="space-between">
            <DocLinkButtonGroup />
          </Flex>
        </VersionSelectorToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body>
        {Preview}
        {Pipelines}
        {DataQuality}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
