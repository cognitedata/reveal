import React from 'react';
import { Icon, Tooltip } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import StatusSquare from 'pages/PageResultsOverview/StatusSquare';
import { useFileStatus } from './hooks';

type Props = {
  workflowId: number;
  file: any;
};

export default function ColumnProgress({
  workflowId,
  file,
}: Props): JSX.Element {
  const { status, didFileFail } = useFileStatus(workflowId, file);

  if (status)
    return (
      <Flex row align>
        <StatusSquare
          status={status}
          style={{ justifyContent: 'flex-start' }}
        />
        {didFileFail && (
          <Tooltip
            content={didFileFail?.errorMessage ?? 'Failed to parse file'}
          >
            <Icon
              type="Help"
              style={{ verticalAlign: '-0.225em', marginLeft: '4px' }}
            />
          </Tooltip>
        )}
      </Flex>
    );
  return <span />;
}
