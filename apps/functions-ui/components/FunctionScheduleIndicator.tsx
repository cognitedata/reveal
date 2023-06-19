import React from 'react';
import { Icon } from 'antd';
import { Tooltip } from '@cognite/cogs.js';
import { useSchedules } from 'utils/hooks';

type Props = {
  id?: number;
};
export default function FunctionScheduleIndicator({ id }: Props) {
  const { data: scheduleResponse } = useSchedules();

  const schedules = scheduleResponse?.filter(s => s.functionId === id) || [];

  if (schedules.length > 0) {
    return (
      <Tooltip placement="top" content={`Has ${schedules.length} schedules`}>
        <Icon
          type="clock-circle"
          theme="twoTone"
          style={{ marginLeft: '8px', verticalAlign: 'text-top' }}
        />
      </Tooltip>
    );
  }
  return null;
}
