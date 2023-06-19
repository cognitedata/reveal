import React from 'react';

import { Tooltip, Icon } from '@cognite/cogs.js';

import { useSchedules } from '../utils/hooks';

type Props = {
  id?: number;
};
export default function FunctionScheduleIndicator({ id }: Props) {
  const { data: scheduleResponse } = useSchedules();

  const schedules = scheduleResponse?.filter((s) => s.functionId === id) || [];

  if (schedules.length > 0) {
    return (
      <Tooltip placement="top" content={`Has ${schedules.length} schedules`}>
        <Icon
          type="Clock"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          style={{ marginLeft: '8px', verticalAlign: 'text-top' }}
        />
      </Tooltip>
    );
  }
  return null;
}
