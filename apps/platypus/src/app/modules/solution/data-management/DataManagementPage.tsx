import React, { lazy, Suspense, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Tabs } from '@cognite/cogs.js';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPage, StyledTabs } from '../data-model/pages/elements';

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

export const DataManagementPage = () => {
  const history = useHistory();
  const { t } = useTranslation('SolutionDataPreview');

  const { subSolutionPage } = useParams<{
    subSolutionPage: string;
  }>();

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab, setTab] = useState<TabType>(initialPage);

  const Preview = (
    <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PreviewPage />
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
        <StyledTabs
          size="default"
          onChange={(key) => {
            setTab(key as TabType);
            history.push(`${!subSolutionPage ? 'data-management/' : ''}${key}`);
          }}
          activeKey={tab}
        >
          <Tabs.TabPane key="preview" tab={t('preview', 'Preview')} />
          <Tabs.TabPane key="pipelines" tab={t('pipelines', 'Pipelines')} />
          <Tabs.TabPane
            key="data-quality"
            tab={t('data_quality', 'Data quality')}
          />
        </StyledTabs>
      </PageContentLayout.Header>
      <PageContentLayout.Body>
        {Preview}
        {Pipelines}
        {DataQuality}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
