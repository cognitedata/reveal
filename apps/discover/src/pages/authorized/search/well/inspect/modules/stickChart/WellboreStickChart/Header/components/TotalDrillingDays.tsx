import isNil from 'lodash/isNil';
import { pluralize } from 'utils/pluralize';

import { Tooltip } from '@cognite/cogs.js';

import { HeaderLabel } from '../elements';

export interface TotalDrillingDaysProps {
  days?: number;
}

export const TotalDrillingDays: React.FC<TotalDrillingDaysProps> = ({
  days,
}) => {
  if (isNil(days)) {
    return null;
  }

  return (
    <Tooltip placement="bottom" content="Total drilling days">
      <HeaderLabel variant="unknown">
        {days} {pluralize('day', days)}
      </HeaderLabel>
    </Tooltip>
  );
};
