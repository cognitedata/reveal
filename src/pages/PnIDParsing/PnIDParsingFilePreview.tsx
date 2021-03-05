import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Title, Tooltip } from '@cognite/cogs.js';
import { itemSelector as fileItemSelector, retrieve } from 'modules/files';
import {
  list as listAnnotations,
  selectAnnotations,
} from 'modules/annotations';
import { CogniteFileViewer } from 'components/CogniteFileViewer/CogniteFileViewer';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { startConvertFileToSvgJob } from 'modules/fileContextualization/uploadJobs';
import { RootState } from 'reducers';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { checkPermission } from 'modules/app';
import Layers from 'utils/zindex';
import { notification } from 'antd';

const Wrapper = styled.div`
  display: flex;
  height: calc(100vh - 180px);
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  padding: 20px 24px;
  box-shadow: 0px 0px 6px #cdcdcd;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  z-index: ${Layers.MINIMUM};
  margin-top: 40px;
  background: #fff;
  button {
    margin-right: 26px;
  }
`;
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-top: 20px;
  box-sizing: border-box;
`;

export default function PnIDParsingFilePreview() {
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

  const fileIdNumber = parseInt(fileId, 10);

  const file = useSelector(fileItemSelector)(fileIdNumber);

  const annotations = useSelector(selectAnnotations)(fileIdNumber);
  const { jobDone, jobError, jobStarted } = useSelector(
    (state: RootState) =>
      state.fileContextualization.uploadJobs[fileIdNumber] || {}
  );
  useEffect(() => {
    dispatch(retrieve([{ id: fileIdNumber }]));
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
      dispatch(listAnnotations(file, false, true));
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
              `/${tenant}/pnid_parsing/${filesDataKitId}/${assetsDataKitId}/${optionsId}`
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
