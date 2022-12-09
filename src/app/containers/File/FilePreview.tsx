import React, { useEffect, useContext, useState } from 'react';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import {
  FilePreviewUFV as CogniteFilePreview,
  ErrorFeedback,
  Loader,
  FileDetails,
  Metadata,
  ResourceType,
} from '@cognite/data-exploration';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { EditFileButton } from 'app/components/TitleRowActions/EditFileButton';
import styled from 'styled-components';
import { Colors, Body, Tabs } from '@cognite/cogs.js';

import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useNavigate, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useOnPreviewTabChange } from 'app/hooks/hooks';
import { DetailsTabWrapper } from 'app/containers/Common/element';
import { Breadcrumbs } from 'app/components/Breadcrumbs/Breadcrumbs';
import { APPLICATION_ID } from 'app/utils/constants';

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
  const sdk = useSDK();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const navigate = useNavigate();
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileId && el.type === 'file'
  );
  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow, 'filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions(flow, 'eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  const { resourceType } = useParams<{
    resourceType: ResourceType;
  }>();

  const { tabType } = useParams<{
    tabType: FilePreviewTabType;
  }>();
  const activeTab = tabType || 'preview';

  const onTabChange = useOnPreviewTabChange(tabType, 'file');

  useEffect(() => {
    if (fileId && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
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
  } = useCdfItem<FileInfo>('files', {
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
    return <ErrorFeedback error={error} />;
  }

  if (!fileInfo) {
    return <>File {fileId} not found!</>;
  }

  return (
    <>
      <CogniteFileViewer.Provider
        sdk={sdk as any}
        disableAutoFetch
        overrideURLMap={{
          pdfjsWorkerSrc:
            '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
        }}
      >
        <Breadcrumbs currentResource={{ title: fileInfo.name }} />
        <ResourceTitleRow
          item={{ id: fileId!, type: resourceType || 'file' }}
          title={fileInfo.name}
          beforeDefaultActions={
            <>
              <EditFileButton
                item={{ type: 'file', id: fileId! }}
                isActive={editMode}
                onClick={() => {
                  setEditMode(mode => !mode);
                }}
              />
            </>
          }
          afterDefaultActions={actions}
        />
        <ResourceDetailsTabs
          parentResource={{
            type: 'file',
            id: fileId,
            externalId: fileInfo.externalId,
            title: fileInfo.name,
          }}
          tab={activeTab}
          onTabChange={onTabChange}
          additionalTabs={[
            <Tabs.TabPane tab={<TabTitle>Preview</TabTitle>} key="preview">
              <PreviewTabWrapper>
                {editMode && (
                  <Banner>
                    <Body level={3}>You have entered editing mode.</Body>
                  </Banner>
                )}
                <CogniteFilePreview
                  key={fileId}
                  id={`${APPLICATION_ID}-${fileId}`}
                  applicationId={APPLICATION_ID}
                  fileId={fileId!}
                  creatable={editMode}
                  contextualization={writeAccess}
                  onItemClicked={item =>
                    navigate(createLink(`/explore/${item.type}/${item.id}`))
                  }
                />
              </PreviewTabWrapper>
            </Tabs.TabPane>,
            <Tabs.TabPane tab={<TabTitle>Details</TabTitle>} key="info">
              <DetailsTabWrapper>
                <FileDetails file={fileInfo} />
                <Metadata metadata={fileInfo.metadata} />
              </DetailsTabWrapper>
            </Tabs.TabPane>,
          ]}
        />
      </CogniteFileViewer.Provider>
    </>
  );
};

const PreviewTabWrapper = styled.div`
  height: 100%;
`;

const Banner = styled.div`
  padding: 16px;
  background: ${Colors['midblue-6'].hex()};
  color: ${Colors.midblue.hex()};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .cogs-body-3 {
    color: ${Colors.midblue.hex()};
  }
`;
