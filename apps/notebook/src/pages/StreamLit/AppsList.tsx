import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components/macro';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { Flex } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useApps } from '../../hooks/useApps';
import { useUserInformation } from '../../hooks/useUserInformation';

import { saveApp, sleep } from './common';
import { AppsListHeader } from './components/AppsListHeader';
import { AppsTable } from './components/AppsTable';
import { CreateAppModal } from './components/CreateAppModal';
import { Spinner } from './components/Spinner/Spinner';
import { defaultApps } from './defaultApps';
import { StreamLitAppSpec, AppData } from './types';

export const AppsList = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filterAppType, setFilterAppType] = useState('yours');

  const navigate = useNavigate();

  const { data: apps = [], refetch: refreshApps, isLoading } = useApps();

  const { data: userInfo, isLoading: isUserInfoLoading } = useUserInformation();

  const userIdentifier = userInfo?.email || userInfo?.userIdentifier || '';

  const navigateToApp = useCallback(
    (appId: string) => {
      const currentUrl = window.location.pathname;
      const queryString = window.location.search;
      const newUrl = currentUrl + `/${appId}` + queryString;

      navigate(newUrl);
    },
    [navigate]
  );

  const onCreateApp = useCallback(
    async (
      name: string,
      externalId: string,
      description: string,
      template?: string,
      dataSet?: DataSet
    ) => {
      trackEvent('StreamlitApps.Create', {
        template,
        name,
        description,
        externalId,
      });

      const code: AppData = template
        ? defaultApps.find((el) => el.name === template)!.file
        : {
            entrypoint: 'pages/main.py',
            files: {
              'pages/main.py': {
                content: {
                  text: `import streamlit as st
from cognite.client import CogniteClient
st.title("An example app in CDF")
client = CogniteClient()

@st.cache_data
def get_assets():
  assets = client.assets.list(limit=1000).to_pandas()
  assets = assets.fillna(0)
  return assets

st.write(get_assets())
`,
                  $case: 'text',
                },
              },
            },
            requirements: ['pyodide-http==0.2.1', 'cognite-sdk==6.21.1'],
          };

      const app: StreamLitAppSpec = {
        name,
        description,
        fileExternalId: externalId,
        dataSetId: dataSet?.id,
        creator: userIdentifier,
        createdAt: new Date(),
        published: false,
        code,
      };
      await saveApp(app, sdk);
      await refreshApps();
      navigateToApp(externalId);
    },
    [navigateToApp, refreshApps, userIdentifier]
  );

  const tableData = useMemo(() => {
    let visibleApps = apps;
    if (searchText.trim()) {
      visibleApps = visibleApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchText.toLowerCase().trim()) ||
          app.description
            .toLowerCase()
            .includes(searchText.toLowerCase().trim())
      );
    }
    if (filterAppType === 'published') {
      visibleApps = visibleApps.filter((app) => app.published);
    } else if (filterAppType === 'yours') {
      visibleApps = visibleApps.filter(
        (app) =>
          app.creator === userInfo?.email ||
          app.creator === userInfo?.userIdentifier
      );
    }
    return visibleApps;
  }, [apps, searchText, filterAppType, userInfo]);

  const appsCount = tableData.length;

  if (isLoading || isUserInfoLoading) {
    return (
      <StyledPageWrapper>
        <Spinner />
      </StyledPageWrapper>
    );
  }

  return (
    <StyledPageWrapper direction="column" gap={16}>
      <AppsListHeader
        appsCount={appsCount}
        onFilterAppTypeChange={setFilterAppType}
        onCreateAppClick={() => setIsCreateModalVisible(true)}
        onSearchChange={(newSearchText) => {
          setSearchText(newSearchText);
        }}
        searchText={searchText}
      />

      <AppsTable
        onAppDeleted={async () => {
          await sleep(200);
          refreshApps();
        }}
        onAppSelected={navigateToApp}
        apps={tableData}
      />
      {isCreateModalVisible && (
        <CreateAppModal
          onCreate={onCreateApp}
          onCancel={() => setIsCreateModalVisible(false)}
        />
      )}
    </StyledPageWrapper>
  );
};

export const StyledPageWrapper = styled(Flex)`
  flex: 1;
  flex-grow: 1;
  flex-direction: column;
  overflow: auto;
  height: 100%;
  padding: 16px;
`;
