import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notification, Divider, Space } from 'antd';
import { Button, Title, Badge, Colors } from '@cognite/cogs.js';
import { RootState } from 'store';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';

import { checkPermission } from 'modules/app';
import { listAnnotations, selectAnnotations } from 'modules/annotations';
import { startConvertFileToSvgJob } from 'modules/contextualization/uploadJobs';
import { retrieveItemsById as retrieve } from 'modules/files';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { ContextFileViewer as CogniteFileViewer } from 'components/CogniteFileViewer';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import {
  ErrorFeedback,
  Loader,
  Tabs,
  FileDetails,
  Metadata,
  useRelatedResourceCounts,
  ResourceItem,
} from '@cognite/data-exploration';
import {
  Wrapper,
  ContentWrapper,
  TitleRowWrapper,
  TabTitle,
} from './components';
import TitleRowActions from './TitleRowActions';
import { ResourceDetailTabContent } from './ResourceDetailTabContent';
import { EditFileButton } from './EditFileButton';
import { ClearTagsButton } from './ClearTagsButton';

export type FilePreviewTabType = 'preview' | 'details' | 'files' | 'assets';

export default function FileOverview() {
  const {
    fileId,
    tenant,
    filesDataKitId,
    assetsDataKitId,
    optionsId,
  } = useParams<{
    fileId: string;
    tenant: string;
    filesDataKitId: string;
    assetsDataKitId: string;
    optionsId: string;
  }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const [activeTab, setActiveTab] = useState<FilePreviewTabType>('preview');
  const [renderFeedback, setRenderFeedback] = useState(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const fileIdNumber = Number(fileId);

  const { data: fileInfo, isFetched, isError, error } = useCdfItem<FileInfo>(
    'files',
    {
      id: fileIdNumber,
    }
  );

  const annotations = useSelector(selectAnnotations)(fileIdNumber);
  const { jobDone, jobError, jobStarted } = useSelector(
    (state: RootState) =>
      state.fileContextualization.uploadJobs[fileIdNumber] || {}
  );

  useEffect(() => {
    dispatch(retrieve({ ids: [{ id: fileIdNumber }] }));
  }, [dispatch, fileIdNumber]);

  useEffect(() => {
    if (fileInfo) {
      dispatch(
        listAnnotations.action({
          file: fileInfo,
          shouldClear: false,
          includeDeleted: true,
        })
      );
    }
  }, [dispatch, fileInfo, editMode]);

  useEffect(() => {
    if (jobDone && !jobError) {
      notification.info({
        key: 'file-deploy-status',
        message: 'SVG created successfully',
        description:
          'A SVG file was successfully generated and published to CDF. You will be able to now view this file on InField.',
      });
    }
    if (jobDone && jobError) {
      notification.error({
        key: 'file-deploy-status',
        message: 'Unable to create SVG',
        description:
          'The SVG was unable to be created, do you have Files:Write access on this tenant?',
      });
    }
  }, [jobDone, jobError]);

  const BackButton = () => (
    <div
      style={{
        display: 'inline-block',
        overflow: 'hidden',
      }}
    >
      <Space>
        <Button
          icon="ArrowBack"
          onClick={() =>
            history.push(
              `/${tenant}/pnid_parsing_new/pipeline/${filesDataKitId}/${assetsDataKitId}/${optionsId}`
            )
          }
        >
          Back
        </Button>{' '}
        <Divider type="vertical" style={{ height: '36px' }} />
      </Space>
    </div>
  );
  const getPermission = useMemo(() => checkPermission('filesAcl', 'WRITE'), []);
  const canEditFiles = useSelector(getPermission);

  const resourceDetails: ResourceItem = {
    type: 'file',
    id: fileIdNumber,
    externalId: fileInfo?.externalId || '',
  };

  const { counts } = useRelatedResourceCounts(resourceDetails);

  if (!isFetched) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorFeedback error={error} />;
  }

  if (!fileInfo) {
    return <>File {fileId} not found!</>;
  }

  return (
    <Wrapper>
      {renderFeedback && (
        <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
      )}
      <TitleRowWrapper>
        <BackButton />
        <Title level={3} style={{ flex: 1 }}>
          {fileInfo.name}
        </Title>
        <div
          style={{
            display: 'inline-block',
            overflow: 'hidden',
          }}
        >
          <TitleRowActions
            actions={
              <>
                <EditFileButton
                  item={{ type: 'file', id: fileIdNumber }}
                  isActive={editMode}
                  onClick={() => {
                    setEditMode((mode) => !mode);
                  }}
                />
                <ClearTagsButton id={fileIdNumber} setEditMode={setEditMode} />
                <Button
                  shape="round"
                  type="primary"
                  icon="Upload"
                  style={{ marginRight: '0px' }}
                  loading={jobStarted}
                  onClick={() => {
                    console.log(
                      'I have been summoned',
                      canEditFiles,
                      annotations
                    );
                    if (canEditFiles) {
                      if (annotations) {
                        dispatch(
                          startConvertFileToSvgJob(fileIdNumber, annotations)
                        );
                      }
                    } else {
                      setRenderFeedback(true);
                    }
                  }}
                >
                  Save to CDF
                </Button>
              </>
            }
          />
        </div>
      </TitleRowWrapper>
      <Tabs
        tab={activeTab}
        onTabChange={(newTab) => {
          setActiveTab(newTab as FilePreviewTabType);
        }}
      >
        <Tabs.Pane key="preview" title={<TabTitle>Preview</TabTitle>}>
          <ContentWrapper>
            <CogniteFileViewer fileId={fileIdNumber} editMode={editMode} />
          </ContentWrapper>
        </Tabs.Pane>
        <Tabs.Pane title={<TabTitle>File details</TabTitle>} key="info">
          <FileDetails file={fileInfo} />
          <Metadata metadata={fileInfo.metadata} />
        </Tabs.Pane>
        <Tabs.Pane
          key="assets"
          title={
            <>
              <TabTitle>Assets</TabTitle>
              <Badge
                text={counts.asset}
                background={Colors['greyscale-grey3'].hex()}
              />
            </>
          }
        >
          <ResourceDetailTabContent resource={resourceDetails} type="asset" />
        </Tabs.Pane>
        <Tabs.Pane
          key="files"
          title={
            <>
              <TabTitle>P&IDs</TabTitle>
              <Badge
                text={counts.file}
                background={Colors['greyscale-grey3'].hex()}
              />
            </>
          }
        >
          <ResourceDetailTabContent resource={resourceDetails} type="file" />
        </Tabs.Pane>
      </Tabs>
      <ResourceSidebar />
    </Wrapper>
  );
}
