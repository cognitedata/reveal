import React, { useState, useEffect, useMemo } from 'react';
import { Progress, Col, Row, Collapse } from 'antd';
import { useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { selectParsingJobForFileId } from 'modules/contextualization/parsingJobs';
import { dataKitItemsSelectorFactory } from 'modules/selection';

import DataKitLoadingProgress from 'components/DataKitLoadingProgress';

interface LoadResourcesProps {
  assetDataKitId: string;
  fileDataKitId: string;
}
export default function LoadResources(props: LoadResourcesProps) {
  const { assetDataKitId, fileDataKitId } = props;
  const [collapseExpanded, setCollapseExpanded] = useState<boolean>(true);

  const getFiles = useMemo(
    () => dataKitItemsSelectorFactory(fileDataKitId, true),
    [fileDataKitId]
  );
  const files = useSelector(getFiles).filter((el) => !!el) as FileInfo[];

  const getParsingJob = useSelector(selectParsingJobForFileId);

  const filesCompleted = files.filter((el) => {
    const jobStatus = getParsingJob(el.id);
    if (jobStatus && jobStatus.jobDone) {
      return true;
    }
    return false;
  });

  const jobDone = filesCompleted.length === files.length;

  useEffect(() => {
    setCollapseExpanded(jobDone);
  }, [jobDone]);

  const parsingJobPercent: number = Math.floor(
    (filesCompleted.length / files.length) * 100
  );
  return (
    <Collapse
      activeKey={collapseExpanded ? undefined : '1'}
      onChange={() => setCollapseExpanded(!collapseExpanded)}
    >
      <Collapse.Panel
        header={jobDone ? 'Resources loaded' : 'Getting your data...'}
        key="1"
      >
        <Row align="middle" type="flex">
          <Col span={4}>
            <p>Files</p>
          </Col>
          <Col span={20}>
            <DataKitLoadingProgress id={fileDataKitId} />
          </Col>
        </Row>
        <Row align="middle" type="flex">
          <Col span={4}>
            <p>Assets</p>
          </Col>
          <Col span={20}>
            <DataKitLoadingProgress id={assetDataKitId} />
          </Col>
        </Row>
        <Row align="middle" type="flex">
          <Col span={4}>
            <p>Matching tags in P&ID to assets</p>
          </Col>
          <Col span={20}>
            <Progress
              percent={parsingJobPercent}
              status={parsingJobPercent === files.length ? 'success' : 'active'}
            />
          </Col>
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
}
