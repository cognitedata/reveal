import { lazy, Suspense, useRef, useState } from 'react';
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

  // Lazy loading when the tab was open the first time
  const openedPages = useRef(new Set().add(initialPage));

  const renderHeader = () => {
    return (
      <PageToolbar title={t('data_management_title', 'Data management')} />
    );
  };

  const renderNavigation = () => {
    return (
      <StyledTabs
        size="default"
        onChange={(key) => {
          setTab(key as TabType);
          openedPages.current.add(key);
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
    );
  };

  const renderPreviewPage = () => {
    // The page is only hidden to keep the state -> { display: 'none' }
    return (
      <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
        {openedPages.current.has('preview') && (
          <Suspense fallback={<Spinner />}>
            <PreviewPage />
          </Suspense>
        )}
      </StyledPage>
    );
  };

  const renderPipelinesPage = () => {
    return (
      <StyledPage style={tab !== 'pipelines' ? { display: 'none' } : {}}>
        {openedPages.current.has('pipelines') && (
          <Suspense fallback={<Spinner />}>
            <PipelinesPage />
          </Suspense>
        )}
      </StyledPage>
    );
  };

  const renderDataQualityPage = () => {
    return (
      <StyledPage style={tab !== 'data-quality' ? { display: 'none' } : {}}>
        {openedPages.current.has('data-quality') && (
          <Suspense fallback={<Spinner />}>
            <DataQualityPage />
          </Suspense>
        )}
      </StyledPage>
    );
  };

  const renderContent = () => {
    return (
      <>
        {renderPreviewPage()}
        {renderPipelinesPage()}
        {renderDataQualityPage()}
      </>
    );
  };

  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>
        {renderNavigation()}
        {renderContent()}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
