import React, { lazy, Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPage } from '../data-model/pages/elements';

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
  // const history = useHistory();
  const { t } = useTranslation('SolutionDataPreview');

  const { subSolutionPage } = useParams<{
    subSolutionPage: string;
  }>();

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab] = useState<TabType>(initialPage);

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
        <PageToolbar title={t('data_management_title', 'Data management')} />
      </PageContentLayout.Header>
      <PageContentLayout.Body>
        {Preview}
        {Pipelines}
        {DataQuality}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
