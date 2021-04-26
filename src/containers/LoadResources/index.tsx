import React from 'react';
import { useSelector } from 'react-redux';
import { Progress, Col, Row, Collapse } from 'antd';
import { getActiveWorkflowId } from 'modules/workflows';
import LoadingProgress from 'components/LoadingProgress';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';

const processProgress: { [key: string]: number } = {
  '': 0,
  New: 10,
  Scheduled: 10,
  Queued: 20,
  Running: 40,
  Completed: 100,
  Failed: 100,
};

const LoadResources = () => {
  const workflowId = useSelector(getActiveWorkflowId);

  const { status: parsingJobStatus, jobId } = useParsingJob(workflowId);

  const parsingJobPercent: number = processProgress[parsingJobStatus];

  return (
    <Collapse defaultActiveKey={['1']}>
      <Collapse.Panel
        header={jobId ? 'Resources loaded' : 'Getting your data...'}
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
};

export default React.memo(LoadResources);
