import React from 'react';
import { useParams } from 'react-router-dom';
import { Progress } from 'antd';
import { Body } from '@cognite/cogs.js';
import { ResourceType } from 'modules/sdk-builder/types';
import {
  useWorkflowLoadedCounts,
  useWorkflowTotalCounts,
} from 'modules/workflows/hooks';

type Props = {
  type?: ResourceType | 'diagrams';
};

export default function LoadingProgress(props: Props) {
  const { type = 'assets' } = props;
  const { workflowId } = useParams<{ workflowId: string }>();
  const diagrams = type === 'diagrams';

  const workflowLoadedCounts = useWorkflowLoadedCounts(Number(workflowId));
  const workflowTotalCounts = useWorkflowTotalCounts(Number(workflowId));

  const downloadedCount: number = diagrams
    ? workflowLoadedCounts.diagrams
    : workflowLoadedCounts.resources?.[type] ?? 0;
  const totalCount: number = diagrams
    ? workflowTotalCounts.diagrams
    : workflowTotalCounts.resources?.[type] ?? 0;
  const percent: number = Math.round(
    (totalCount ? downloadedCount / totalCount : 0) * 100
  );

  return (
    <>
      <Body level={2} strong>
        Loading {type} ({downloadedCount}/{totalCount})
      </Body>
      <Progress
        percent={percent}
        status={percent === 100 ? 'success' : 'active'}
      />
    </>
  );
}
