import { NPTEvent } from 'modules/wellSearch/types';

import { NO_DEFINITION } from '../../constants';
import { NptCodeDefinitionType } from '../../types';
import { formatTooltip } from '../utils';

export const NptTooltip: React.FC<{
  event: NPTEvent;
  definitions?: NptCodeDefinitionType;
}> = ({ event, definitions }) => {
  return (
    <>
      <div>{formatTooltip(event)}</div>
      <div>
        {(definitions && definitions[event?.nptCode || '']) || NO_DEFINITION}
      </div>
    </>
  );
};
