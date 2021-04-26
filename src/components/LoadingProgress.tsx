import React from 'react';
import { useParams } from 'react-router-dom';
import { Progress } from 'antd';
import { Body } from '@cognite/cogs.js';
import { ResourceType } from 'modules/sdk-builder/types';
import { useWorkflowLoadPercentages } from 'modules/workflows/hooks';

type Props = {
  type?: ResourceType | 'diagrams';
};

export default function LoadingProgress(props: Props) {
  const { type = 'assets' } = props;
  const { workflowId } = useParams<{ workflowId: string }>();

  const {
    downloadedCount,
    totalCount,
    loadedPercent,
  } = useWorkflowLoadPercentages(Number(workflowId), type);

  return (
    <>
      <Body level={2} strong>
        Loading {type} ({downloadedCount}/{totalCount})
      </Body>
      <Progress
        percent={loadedPercent}
        status={loadedPercent === 100 ? 'success' : 'active'}
      />
    </>
  );
}
