import React from 'react';
import { useParams } from 'react-router-dom';
import { Progress } from 'antd';
import { Body } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import { ResourceType } from 'modules/sdk-builder/types';
import { useWorkflowLoadPercentages } from 'modules/workflows/hooks';

type Props = {
  type?: ResourceType | 'diagrams';
  label: string;
};

export default function LoadingProgress(props: Props) {
  const { label, type = 'assets' } = props;
  const { workflowId } = useParams<{ workflowId: string }>();

  const { downloadedCount, totalCount, loadedPercent } =
    useWorkflowLoadPercentages(Number(workflowId), type);

  return (
    <Flex column style={{ width: '100%', margin: '4px 0' }}>
      <Body level={2} strong>
        {label} ({downloadedCount}/{totalCount})
      </Body>
      <Progress
        percent={loadedPercent}
        status={loadedPercent === 100 ? 'success' : 'active'}
      />
    </Flex>
  );
}
