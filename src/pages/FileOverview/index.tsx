import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from 'antd';
import { Button, Icon, Title, Tooltip } from '@cognite/cogs.js';
import { RootState } from 'store';

import { checkPermission } from 'modules/app';
import { listAnnotations, selectAnnotations } from 'modules/annotations';
import { startConvertFileToSvgJob } from 'modules/contextualization/uploadJobs';
import {
  itemSelector as fileItemSelector,
  retrieveItemsById as retrieve,
} from 'modules/files';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { Wrapper, ContentWrapper, Header } from './components';

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

  const fileIdNumber = Number(fileId);

  // @ts-ignore
  const file = useSelector(fileItemSelector)(fileIdNumber);
  const annotations = useSelector(selectAnnotations)(fileIdNumber);
  const { jobDone, jobError, jobStarted } = useSelector(
    (state: RootState) =>
      state.fileContextualization.uploadJobs[fileIdNumber] || {}
  );

  useEffect(() => {
    dispatch(retrieve({ ids: [{ id: fileIdNumber }] }));
  }, [dispatch, fileIdNumber]);

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

  useEffect(() => {
    if (file) {
      dispatch(
        listAnnotations.action({
          file,
          shouldClear: false,
          includeDeleted: true,
        })
      );
    }
  }, [dispatch, file]);

  const getPermission = useMemo(() => checkPermission('filesAcl', 'WRITE'), []);
  const canEditFiles = useSelector(getPermission);
  const [renderFeedback, setRenderFeedback] = useState(false);
  return (
    <Wrapper>
      {renderFeedback && (
        <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
      )}
      <Header>
        <Button
          shape="round"
          icon="ArrowLeft"
          onClick={() =>
            history.push(
              `/${tenant}/pnid_parsing_new/pipeline/${filesDataKitId}/${assetsDataKitId}/${optionsId}`
            )
          }
        >
          Back
        </Button>
        <Title level={3} style={{ flex: 1 }}>
          {file ? file.name : 'Loading...'}
        </Title>
        <Tooltip
          placement="left"
          content="This will create or update an interactive SVG linked to the assets for this file."
        >
          <Icon type="Help" style={{ marginRight: '24px', fontSize: '18px' }} />
        </Tooltip>
        <Button
          shape="round"
          type="primary"
          icon="Upload"
          style={{ marginRight: '0px' }}
          loading={jobStarted}
          onClick={() => {
            if (canEditFiles) {
              if (annotations) {
                dispatch(startConvertFileToSvgJob(fileIdNumber, annotations));
              }
            } else {
              setRenderFeedback(true);
            }
          }}
        >
          Save to CDF
        </Button>
      </Header>
      <ContentWrapper>
        <CogniteFileViewer
          fileId={fileIdNumber}
          onFileClicked={(newFile) => history.push(`${newFile.id}`)}
        />
      </ContentWrapper>
      <ResourceSidebar />
    </Wrapper>
  );
}
