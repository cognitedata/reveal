import {
  NptCodeDefinitionType,
  NptView,
} from 'domain/wells/npt/internal/types';

import { NO_DEFINITION } from '../../components/constants';
import { formatTooltip } from '../utils';

export const NptTooltip: React.FC<{
  event: NptView;
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
