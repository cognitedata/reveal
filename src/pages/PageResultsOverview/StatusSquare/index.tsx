import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { Body } from '@cognite/cogs.js';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';
import { Flex } from 'components/Common';
import { statusData, StatusData } from 'components/Filters';
import { Square } from './Square';

type Props = {
  status: keyof ApiStatusCount | 'idle';
  small?: boolean;
  hoverContent?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function StatusSquare(props: Props) {
  const { status, hoverContent, small = false, style = {} } = props;
  const [currentStatus, setCurrentStatus] = useState<StatusData>(statusData[0]);

  useEffect(() => {
    const newStatus = statusData.find((s) => s.type === status);
    if (newStatus) setCurrentStatus(newStatus);
  }, [status]);

  return (
    <Tooltip title={hoverContent}>
      <Flex
        row
        align
        justify
        style={{ cursor: hoverContent ? 'help' : 'default', ...style }}
      >
        <Square color={currentStatus.color} />
        <Body level={small ? 3 : 2}>{currentStatus.label}</Body>
      </Flex>
    </Tooltip>
  );
}
