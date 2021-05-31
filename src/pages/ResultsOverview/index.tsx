import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, message } from 'antd';
import { Button, Tooltip, Title } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
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
import { TOOLTIP_STRINGS } from 'stringConstants';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import ProgressBarSection from './ProgressBarSection';
import { getWorkflowItems, getContextualizationJobs } from './selectors';
import ResultsTable from './ResultsTable';
import EmptyStateFiles from './EmptyStateFiles';

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
  const parsingJob = useParsingJob(workflowId);
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
      message.error('Invalid data selections');
      history.push(diagramSelection.path(tenant, String(workflowId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow]);

  const startUploadJob = () => {
    if (canEditFiles) {
      selectedKeys.forEach((key) => {
        dispatch(startConvertFileToSvgJob(key, annotationsByFileId[key] ?? []));
      });
      trackUsage(PNID_METRICS.results.convertToSvg, {
        count: selectedKeys.length,
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
  const canDeploy = canDeploySelectedFiles(parsingJob, selectedKeys);
  const convertToSvgTooltip = () => {
    if (selectedKeys.length === 0)
      return TOOLTIP_STRINGS.CONVERT_TO_SVG_NOT_SELECTED;
    if (!canDeploy) return TOOLTIP_STRINGS.CONVERT_TO_SVG_DISABLED;
    return TOOLTIP_STRINGS.CONVERT_TO_SVG_ALLOWED;
  };

  return renderFeedback ? (
    <>
      <MissingPermissionFeedback key="eventsAcl" acl="eventsAcl" type="WRITE" />
      <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
    </>
  ) : (
    <Flex column style={{ width: '100%' }}>
      <Flex align style={{ width: '100%', justifyContent: 'space-between' }}>
        <PageTitle>Review the created interactive diagrams</PageTitle>
        <Tooltip content={convertToSvgTooltip()} placement="left">
          <Button
            type="primary"
            disabled={!canDeploy}
            onClick={startUploadJob}
            loading={isLoading}
          >
            Create SVGs from {selectedKeys.length} selected diagrams
          </Button>
        </Tooltip>
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
      <Card
        title={
          <Title level={5}>
            Results preview{' '}
            <span style={{ fontWeight: 'lighter', color: '#8C8C8C' }}>
              {diagrams.length}
            </span>
          </Title>
        }
      >
        <Flex grow style={{ width: '100%', margin: '12px 0' }}>
          {parsingJob?.annotationCounts ? (
            <ResultsTable
              rows={rows}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              setRenderFeedback={setRenderFeedback}
            />
          ) : (
            <EmptyStateFiles />
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
