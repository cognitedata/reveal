import { lazy, Suspense } from 'react';

import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

import { PageLayout } from '@platypus-app/components/Layouts/PageLayout';
import {
  SideBarItem,
  SideBarMenu,
} from '@platypus-app/components/Navigations/SideBarMenu';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import { useDataModelVersions } from '@platypus-app/hooks/useDataModelActions';
import { useDataQualityFeatureFlag } from '@platypus-app/flags';
import { NavigationDataModel } from '@platypus-app/components/Navigations/NavigationDataModel';
import { useGPTSearch } from '@platypus-app/flags';

const DataModelPage = lazy<any>(() =>
  import('./data-model/pages/DataModelPage').then((module) => ({
    default: module.DataModelPage,
  }))
);

const DataManagementPage = lazy<any>(() =>
  import('./data-management/DataManagementPage').then((module) => ({
    default: module.DataManagementPage,
  }))
);

const DataQualityPage = lazy<any>(() =>
  import('./data-quality/DataQualityPage').then((module) => ({
    default: module.DataQualityPage,
  }))
);

const QueryExplorerPage = lazy<any>(() =>
  import('./query-explorer/pages/QueryExplorerPage').then((module) => ({
    default: module.QueryExplorerPage,
  }))
);
const SearchPage = lazy<any>(() =>
  import('./query-explorer/pages/SearchPage').then((module) => ({
    default: module.SearchPage,
  }))
);

export const DataLayout = () => {
  const { t } = useTranslation('SolutionDataModel');
  const { isEnabled: isGPTEnabled } = useGPTSearch();
  const { dataModelExternalId, space } = useParams<{
    dataModelExternalId: string;
    space: string;
  }>();

  const { data: versions = [] } = useDataModelVersions(
    dataModelExternalId!,
    space!
  );

  const hasNoPublishedVersion = versions.length === 0;

  const { isEnabled: isDataQualityEnabled } = useDataQualityFeatureFlag();

  const disabledText = t(
    'disabled_text',
    ' (disabled until a data model is published)'
  );

  const sideBarMenuItems: SideBarItem[] = [
    {
      icon: 'GraphTree',
      slug: '',
      tooltip: t('data_model_title', 'Data model'),
    },
    {
      icon: 'DataSource',
      slug: 'data-management/preview',
      tooltip: `${t('data_management_title', 'Data management')}${
        hasNoPublishedVersion ? disabledText : ''
      }`,
      disabled: hasNoPublishedVersion,
    },
    ...(isGPTEnabled
      ? ([
          {
            icon: 'Search',
            slug: 'search',
            tooltip: `${t('gpt_search_title', 'Search')}${
              hasNoPublishedVersion ? disabledText : ''
            }`,
            splitter: true,
            disabled: hasNoPublishedVersion,
          },
        ] as SideBarItem[])
      : []),
    {
      icon: 'CodeBraces',
      slug: 'query-explorer',
      tooltip: `${t('query_explorer_title', 'Query explorer')}${
        hasNoPublishedVersion ? disabledText : ''
      }`,
      disabled: hasNoPublishedVersion,
    },
  ];

  // Show the Data Quality tab only if the feature flag is enabled
  if (isDataQualityEnabled) {
    const dataQualityTab: SideBarItem = {
      icon: 'Heartbeat',
      slug: 'data-quality',
      tooltip: `${t('data_quality_title', 'Data quality')}${
        hasNoPublishedVersion ? disabledText : ''
      }`,
      disabled: hasNoPublishedVersion,
    };
    sideBarMenuItems.splice(2, 0, dataQualityTab);
  }

  return (
    <Routes>
      <Route
        element={
          <StyledPageWrapper data-testid="data_model_page_wrapper">
            <NavigationDataModel />
            <PageLayout>
              <PageLayout.Navigation>
                <SideBarMenu items={sideBarMenuItems} />
              </PageLayout.Navigation>
              <PageLayout.Content>
                <Suspense fallback={<Spinner />}>
                  <Outlet />
                </Suspense>
              </PageLayout.Content>
            </PageLayout>
          </StyledPageWrapper>
        }
      >
        <Route index element={<DataModelPage />} />
        <Route
          path="data-management/:subSolutionPage"
          element={
            <DataManagementPage
              dataModelExternalId={dataModelExternalId}
              space={space}
            />
          }
        />

        {isDataQualityEnabled && (
          <Route
            path="data-quality"
            element={
              <DataQualityPage
                dataModelExternalId={dataModelExternalId}
                space={space}
              />
            }
          />
        )}

        <Route
          path="search"
          element={
            <SearchPage
              dataModelExternalId={dataModelExternalId}
              space={space}
            />
          }
        />
        <Route
          path="query-explorer"
          element={
            <QueryExplorerPage
              dataModelExternalId={dataModelExternalId}
              space={space}
            />
          }
        />
        {/* default redirect to parent route if user lands on unknown route */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
};
