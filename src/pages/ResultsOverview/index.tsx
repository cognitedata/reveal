import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Tooltip } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { message } from 'antd';
import { useWorkflowItems, WorkflowStep } from 'modules/workflows';
import {
  startConvertFileToSvgJob,
  UploadJobState,
} from 'modules/contextualization/uploadJobs';
import { startPnidParsingWorkflow } from 'modules/contextualization/pnidWorkflow';
import { useAnnotationsForFiles, useActiveWorkflow } from 'hooks';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { Flex, PageTitle } from 'components/Common';
import { canDeploySelectedFiles } from 'utils/FilesUtils';
import { diagramSelection } from 'routes/paths';
import { AppStateContext } from 'context';
import ProgressBarSection from './ProgressBarSection';
import { getWorkflowItems, getContextualizationJobs } from './selectors';
import ResultsTable from './ResultsTable';

type Props = {
  step: WorkflowStep;
};
export default function ResultsOverview(props: Props) {
  const { step } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const { tenant } = useContext(AppStateContext);

  const [jobStarted, setJobStarted] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([] as number[]);
  const [renderFeedback, setRenderFeedback] = useState(false);

  const canEditFiles = usePermissions('filesAcl', 'WRITE');
  const canReadFiles = usePermissions('filesAcl', 'READ');

  const { workflowId } = useActiveWorkflow(step);
  const { diagrams } = useWorkflowItems(workflowId, true);
  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const { uploadJobs } = useSelector(getContextualizationJobs);
  const annotationsByFileId = useAnnotationsForFiles(selectedKeys);

  const isLoading = Object.values(uploadJobs).some((job: any) => !job.jobDone);

  useEffect(() => {
    if (jobStarted) return;
    if (canEditFiles && canReadFiles) {
      dispatch(startPnidParsingWorkflow.action(workflowId));
      setJobStarted(true);
    } else setRenderFeedback(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStarted, canEditFiles, canReadFiles, workflowId]);

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid Data Selections...');
      history.push(diagramSelection.path(tenant, String(workflowId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow]);

  const startUploadJob = () => {
    if (canEditFiles) {
      selectedKeys.forEach((key) => {
        if (annotationsByFileId[key]) {
          dispatch(startConvertFileToSvgJob(key, annotationsByFileId[key]));
        } else {
          const diagramToConvert = diagrams.find(
            (diagram: FileInfo) => diagram.id === key
          );
          if (diagramToConvert) {
            message.error(`${diagramToConvert.name} has no annotations`);
          } else {
            message.error(`we are still loading file ${key}`);
          }
        }
      });
    } else {
      setRenderFeedback(true);
    }
  };

  const rows = diagrams
    .filter((diagram: FileInfo) => !!diagram)
    .map((diagram: FileInfo) => {
      return {
        ...diagram,
        uploadJob: uploadJobs[diagram.id],
      } as FileInfo & {
        uploadJob?: UploadJobState;
      };
    });

  return renderFeedback ? (
    <>
      <MissingPermissionFeedback key="eventsAcl" acl="eventsAcl" type="WRITE" />
      <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
    </>
  ) : (
    <Flex column style={{ width: '100%' }}>
      <Flex align style={{ width: '100%', justifyContent: 'space-between' }}>
        <Flex column>
          <PageTitle>Review the contextualized P&IDs</PageTitle>
        </Flex>
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
        <ProgressBarSection />
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
