import { Tooltip } from '@cognite/cogs.js';

import { WellboreData } from '../../../types';
import { HeaderLabel } from '../elements';

export interface TotalDrillingDaysProps {
  totalDrillingDays: WellboreData['totalDrillingDays'];
}

export const TotalDrillingDays: React.FC<TotalDrillingDaysProps> = ({
  totalDrillingDays,
}) => {
  if (!totalDrillingDays) {
    return null;
  }

  return (
    <Tooltip placement="bottom" content="Total drilling days">
      <HeaderLabel>{totalDrillingDays} days</HeaderLabel>
    </Tooltip>
  );
};
