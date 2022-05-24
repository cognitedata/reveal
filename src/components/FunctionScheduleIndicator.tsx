import React from 'react';

import { Icon, Tooltip } from '@cognite/cogs.js';
import { useSchedules } from 'utils/hooks';

type Props = {
  id?: number;
  externalId?: string;
};
export default function FunctionScheduleIndicator({ id, externalId }: Props) {
  const { data: scheduleResponse } = useSchedules();

  const schedules =
    scheduleResponse?.filter(
      s => s.functionExternalId === externalId || s.functionId === id
    ) || [];

  if (schedules.length > 0) {
    return (
      <Tooltip placement="top" content={`Has ${schedules.length} schedules`}>
        <Icon
          type="Clock"
          style={{ marginLeft: '8px', verticalAlign: 'text-top' }}
        />
      </Tooltip>
    );
  }
  return null;
}
