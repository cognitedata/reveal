import { lazy, Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageContentLayout } from '../../../components/Layouts/PageContentLayout';
import { Spinner } from '../../../components/Spinner/Spinner';
import { StyledPage } from '../data-model/pages/elements';

type TabType = 'preview' | 'pipelines' | 'data-quality';

const PreviewPage = lazy<any>(() =>
  import('./pages/Preview').then((module) => ({
    default: module.Preview,
  }))
);

export const DataManagementPage = () => {
  const { subSolutionPage } = useParams() as {
    subSolutionPage: string;
    version: string;
  };

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab] = useState<TabType>(initialPage);

  const Preview = (
    <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PreviewPage />
      </Suspense>
    </StyledPage>
  );

  return (
    <PageContentLayout>
      <PageContentLayout.Body>{Preview}</PageContentLayout.Body>
    </PageContentLayout>
  );
};
