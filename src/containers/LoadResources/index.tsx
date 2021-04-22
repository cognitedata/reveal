import React from 'react';
import { useSelector } from 'react-redux';
import { Progress, Col, Row, Collapse } from 'antd';
import { FileInfo } from '@cognite/sdk';
import { selectParsingJobForFileId } from 'modules/contextualization/parsingJobs';
import { useWorkflowDiagrams } from 'modules/workflows/hooks';
import { getActiveWorkflowId } from 'modules/workflows';
import LoadingProgress from 'components/LoadingProgress';

export default function LoadResources() {
  const workflowId = useSelector(getActiveWorkflowId);
  const getParsingJob = useSelector(selectParsingJobForFileId);
  const diagrams = useWorkflowDiagrams(workflowId, true) as FileInfo[];

  const diagramsCompleted = diagrams.filter((diagram) => {
    const jobStatus = getParsingJob(diagram.id);
    return jobStatus && jobStatus.jobDone;
  });

  const jobDone = diagramsCompleted.length === diagrams.length;

  const parsingJobPercent: number = Math.floor(
    (diagramsCompleted.length / diagrams.length) * 100
  );

  return (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel
        header={jobDone ? 'Resources loaded' : 'Getting your data...'}
        key="1"
      >
        <Row align="middle">
          <Col span={4}>
            <p>Diagrams</p>
          </Col>
          <Col span={20}>
            <LoadingProgress type="diagrams" />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={4}>
            <p>Assets</p>
          </Col>
          <Col span={20}>
            <LoadingProgress type="assets" />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={4}>
            <p>Matching tags in P&ID to assets</p>
          </Col>
          <Col span={20}>
            <Progress
              percent={parsingJobPercent}
              status={parsingJobPercent === 100 ? 'success' : 'active'}
            />
          </Col>
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
}
