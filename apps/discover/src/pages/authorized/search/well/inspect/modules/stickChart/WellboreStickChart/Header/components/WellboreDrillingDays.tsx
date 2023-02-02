import isNil from 'lodash/isNil';
import { pluralize } from 'utils/pluralize';

import { Tooltip } from '@cognite/cogs.js';

import { HeaderLabel } from '../elements';

export interface WellboreDrillingDaysProps {
  days?: number;
}

export const WellboreDrillingDays: React.FC<WellboreDrillingDaysProps> = ({
  days,
}) => {
  if (isNil(days)) {
    return null;
  }

  return (
    <Tooltip placement="bottom" content="Wellbore drilling days">
      <HeaderLabel>
        {days} {pluralize('day', days)}
      </HeaderLabel>
    </Tooltip>
  );
};
