import React from 'react';
import { useSelector } from 'react-redux';
import { Progress, Col, Row, Collapse } from 'antd';
import { getActiveWorkflowId } from 'modules/workflows';
import LoadingProgress from 'components/LoadingProgress';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { Popover } from 'components/Common';
import { Body, Icon } from '@cognite/cogs.js';

const LoadResources = () => {
  const workflowId = useSelector(getActiveWorkflowId);

  const { jobId, statusCount } = useParsingJob(workflowId);

  const { completed = 0, running = 0, queued = 0 } = statusCount ?? {};

  const parsingJobPercent: number = Math.round(
    (completed / (running + completed + queued)) * 100
  );

  const FilesStatusCounts = () => (
    <span>
      <Body level={2}>
        <Icon type="Checkmark" /> Completed: {completed}
      </Body>
      <Body level={2}>
        <Icon type="Loading" /> Running: {running}
      </Body>
      <Body level={2}>
        <Icon type="Schedule" /> Queued: {queued}
      </Body>
    </span>
  );
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
            <p>Matching tags in diagrams to assets</p>
          </Col>
          <Col span={20}>
            <Body level={2} strong>
              <Popover content={<FilesStatusCounts />}>
                Parsed diagrams: {completed}
              </Popover>
            </Body>
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
