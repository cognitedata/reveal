import React from 'react';

import { Icon, Tooltip } from '@cognite/cogs.js';

import { Flex } from '../../../../components/Common';
import { useFileStatus } from '../../../../hooks';
import StatusSquare from '../../StatusSquare';

type Props = {
  file: any;
};

export default function ColumnProgress({ file }: Props): JSX.Element {
  const { status, didFileFail } = useFileStatus(file);

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
              css={{ verticalAlign: '-0.225em', marginLeft: '4px' }}
            />
          </Tooltip>
        )}
      </Flex>
    );
  return <span />;
}
