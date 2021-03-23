import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Tooltip, Title } from '@cognite/cogs.js';
import { message } from 'antd';
import { FileInfo } from '@cognite/sdk';
import { dataKitItemsSelectorFactory } from 'modules/selection';
import { checkPermission } from 'modules/app';
import {
  startConvertFileToSvgJob,
  UploadJobState,
} from 'modules/contextualization/uploadJobs';
import { startPnidParsingPipeline } from 'modules/contextualization/pnidPipeline';
import { ParsingJobState } from 'modules/contextualization/parsingJobs';
import LoadResources from 'containers/LoadResources';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { Flex } from 'components/Common';
import { canDeploySelectedFiles } from 'utils/FilesUtils';
import ResultsTable from './ResultsTable';
import {
  getDataKitItems,
  getPnidOptions,
  getFileContextualizationJobs,
  getAnnotationsByFileId,
} from './selectors';

export default function ResultsOverview() {
  const history = useHistory();
  const dispatch = useDispatch();

  const [selectedKeys, setSelectedKeys] = useState([] as number[]);
  const { tenant, assetsDataKitId, filesDataKitId } = useParams<{
    tenant: string;
    filesDataKitId: string;
    assetsDataKitId: string;
  }>();

  const getFiles = useMemo(
    () => dataKitItemsSelectorFactory(filesDataKitId, true),
    [filesDataKitId]
  );
  const getCanEditFiles = useMemo(
    () => checkPermission('filesAcl', 'WRITE'),
    []
  );
  const getCanReadFiles = useMemo(
    () => checkPermission('filesAcl', 'READ'),
    []
  );

  const files = useSelector(getFiles) as FileInfo[];
  const canEditFiles = useSelector(getCanEditFiles);
  const canReadFiles = useSelector(getCanReadFiles);
  const { assetDataKit, fileDataKit } = useSelector(
    getDataKitItems(assetsDataKitId, filesDataKitId)
  );
  const annotationsByFileId = useSelector(getAnnotationsByFileId);
  const { partialMatch, grayscale } = useSelector(getPnidOptions);
  const { parsingJobs, uploadJobs } = useSelector(getFileContextualizationJobs);

  const isLoading = Object.values(uploadJobs).some((job: any) => !job.jobDone);

  useEffect(() => {
    if (!assetDataKit || !fileDataKit) {
      message.error('Invalid Data Selections...');
      history.push(`/${tenant}/pnid_parsing_new/pipeline`);
    }
  }, [history, tenant, assetDataKit, fileDataKit]);
  useEffect(() => {
    if (canEditFiles && canReadFiles) {
      dispatch(startPnidParsingPipeline(filesDataKitId, assetsDataKitId));
    } else {
      setRenderFeedback(true);
    }
  }, [
    assetsDataKitId,
    canEditFiles,
    canReadFiles,
    dispatch,
    filesDataKitId,
    grayscale,
    partialMatch,
  ]);

  const startUploadJob = () => {
    if (canEditFiles) {
      selectedKeys.forEach((key) => {
        if (annotationsByFileId[key].annotations) {
          dispatch(
            startConvertFileToSvgJob(key, annotationsByFileId[key].annotations)
          );
        } else {
          const file = files.find((el) => el.id === key);
          if (file) {
            message.error(`${file.name} has no annotations`);
          } else {
            message.error(`we are still loading file ${key}`);
          }
        }
      });
    } else {
      setRenderFeedback(true);
    }
  };

  const rows = files
    .filter((el) => !!el)
    .map((file) => {
      return {
        ...file,
        parsingJob: parsingJobs[file.id],
        uploadJob: uploadJobs[file.id],
      } as FileInfo & {
        parsingJob?: ParsingJobState;
        uploadJob?: UploadJobState;
      };
    });

  const [renderFeedback, setRenderFeedback] = useState(false);

  return renderFeedback ? (
    <>
      <MissingPermissionFeedback key="eventsAcl" acl="eventsAcl" type="WRITE" />
      <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
    </>
  ) : (
    <Flex column>
      <Flex align style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Contextualize P&IDs</Title>
        <Flex align style={{ justifyContent: 'flex-end' }}>
          <Tooltip
            placement="left"
            content="This will create or update an interactive SVG linked to the assets for the selected files."
          >
            <Icon
              type="Help"
              style={{
                marginRight: '24px',
                fontSize: '18px',
                display: 'inline-block',
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            disabled={!canDeploySelectedFiles(rows, selectedKeys)}
            title={
              !canDeploySelectedFiles(rows, selectedKeys) &&
              selectedKeys.length !== 0
                ? 'Not all selected files can be deployed to CDF. This might be caused by them still being in "Pending" state or the parsing job failed. Please check if all selected files finished parsing with success.'
                : ''
            }
            onClick={startUploadJob}
            loading={isLoading}
          >
            {`Deploy ${selectedKeys.length} files to CDF`}
          </Button>
        </Flex>
      </Flex>
      <Flex
        grow
        style={{
          width: '100%',
          margin: '12px 0',
        }}
      >
        <LoadResources
          assetDataKitId={assetsDataKitId}
          fileDataKitId={filesDataKitId}
        />
      </Flex>
      <Flex grow style={{ width: '100%', margin: '12px 0' }}>
        <ResultsTable
          rows={rows}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          setRenderFeedback={setRenderFeedback}
        />
      </Flex>
    </Flex>
  );
}
