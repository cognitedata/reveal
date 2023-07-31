import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { Tooltip } from '@cognite/cogs.js';

import { HeaderLabel } from '../elements';

export interface RigNamesProps {
  rigNames?: string[];
}

export const RigNames: React.FC<RigNamesProps> = ({ rigNames }) => {
  if (!rigNames || isEmpty(rigNames)) {
    return null;
  }

  return (
    <Tooltip placement="bottom" content={pluralize('Rig name', rigNames)}>
      <HeaderLabel>{rigNames.join(', ')}</HeaderLabel>
    </Tooltip>
  );
};
