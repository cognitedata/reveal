import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Loader, Metadata } from '@data-exploration/components';
import { FileInfo } from '@data-exploration/containers';
import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { APPLICATION_ID } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import qs from 'query-string';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { Tabs, Infobar } from '@cognite/cogs.js';
import {
  FilePreview as CogniteFilePreview,
  ErrorFeedback,
  ResourceType,
} from '@cognite/data-exploration';
import { CogniteError, FileInfo as FileInfoType } from '@cognite/sdk';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';

export type FilePreviewTabType =
  | 'preview'
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'assets';

export const FilePreview = ({
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
  const navigate = useNavigate();
  const location = useLocation();
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

  const { tabType } = useParams<{
    tabType: FilePreviewTabType;
  }>();
  const activeTab = tabType || 'preview';

  const onTabChange = useOnPreviewTabChange(tabType, 'file');
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
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

  // TODO: is this a needed check?
  if (!fileInfo) {
    return <>File {fileId} not found!</>;
  }

  return (
    <>
      <Breadcrumbs currentResource={{ title: fileInfo.name }} />
      <ResourceTitleRow
        item={{ id: fileId!, type: resourceType || 'file' }}
        title={fileInfo.name}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'file',
          id: fileId,
          externalId: fileInfo.externalId,
          title: fileInfo.name,
        }}
        onTabChange={onTabChange}
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
                onItemClicked={(item) =>
                  navigate(
                    createLink(
                      `/explore/${item.type}/${item.id}`,
                      qs.parse(location.search)
                    )
                  )
                }
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
