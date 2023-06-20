import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Loader, Metadata } from '@data-exploration/components';
import { FileInfo } from '@data-exploration/containers';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Tabs, Infobar } from '@cognite/cogs.js';
import {
  FilePreview as CogniteFilePreview,
  ErrorFeedback,
  ResourceType,
} from '@cognite/data-exploration';
import { CogniteError, FileInfo as FileInfoType } from '@cognite/sdk';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';

import { BreadcrumbsV2 } from '@data-exploration-app/components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRowV2 from '@data-exploration-app/components/ResourceTitleRowV2';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabsV2 } from '@data-exploration-app/containers/ResourceDetails';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import {
  useEndJourney,
  usePushJourney,
  useResourceDetailSelectedTab,
} from '@data-exploration-app/hooks';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import {
  APPLICATION_ID,
  SUB_APP_PATH,
  createInternalLink,
} from '@data-exploration-lib/core';

// FilePreviewTabType;
// - preview
// - details
// - timeseries
// - files
// - sequences
// - events
// - assets

export const FileDetail = ({
  fileId,
  actions,
}: {
  fileId: number;
  actions?: React.ReactNode;
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const [pushJourney] = usePushJourney();
  const isActive = resourcesState.some(
    // eslint-disable-next-line lodash/prefer-matches
    (el) => el.state === 'active' && el.id === fileId && el.type === 'file'
  );
  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow as any, 'filesAcl', 'WRITE');
  const { data: annotationsAcl } = usePermissions(
    flow as any,
    'annotationsAcl',
    'WRITE'
  );
  const writeAccess = filesAcl && annotationsAcl;

  const { resourceType } = useParams<{
    resourceType: ResourceType;
  }>();

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();
  const activeTab = selectedTab || 'preview';

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    if (fileId && !isActive) {
      setResourcesState(
        resourcesState
          .filter((el) => el.state !== 'active')
          .concat([{ id: fileId, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileId, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.Preview.File', { fileId });
    setEditMode(false);
  }, [fileId]);

  const {
    data: fileInfo,
    isLoading,
    isError,
    error,
  } = useCdfItem<FileInfoType>('files', {
    id: fileId!,
  });

  useEffect(() => {
    if (fileInfo !== undefined) {
      // save File preview as view resource in user history
      if (fileInfo?.name)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: fileInfo?.name,
          path: createInternalLink(pathname, searchParams),
        });
      trackUsage('Exploration.Preview.File.MimeType', {
        mimeType: fileInfo.mimeType,
      });
    }
  }, [fileInfo]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!fileInfo) {
    return <>File {fileId} not found!</>;
  }

  return (
    <>
      <BreadcrumbsV2 />
      <ResourceTitleRowV2
        item={{ id: fileId!, type: resourceType || 'file' }}
        title={fileInfo.name}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabsV2
        parentResource={{
          type: 'file',
          id: fileId,
          externalId: fileInfo.externalId,
          title: fileInfo.name,
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab label="Preview" key="preview" tabKey="preview">
            <PreviewTabWrapper>
              {editMode && (
                <Infobar
                  type="neutral"
                  buttonText="Done editing"
                  onButtonClick={() => setEditMode(false)}
                >
                  You are in editing mode.
                </Infobar>
              )}
              <CogniteFilePreview
                key={fileId}
                id={`${APPLICATION_ID}-${fileId}`}
                applicationId={APPLICATION_ID}
                fileId={fileId!}
                creatable={editMode}
                contextualization={writeAccess}
                onItemClicked={(item) => {
                  pushJourney({ id: item.id, type: item.type });
                }}
                setEditMode={() => setEditMode((mode) => !mode)}
                filesAcl={filesAcl}
                annotationsAcl={annotationsAcl}
              />
            </PreviewTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab label="Details" key="info" tabKey="info">
            <DetailsTabWrapper>
              <FileInfo file={fileInfo} />
              <Metadata metadata={fileInfo.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};

const PreviewTabWrapper = styled.div`
  height: 100%;
`;
