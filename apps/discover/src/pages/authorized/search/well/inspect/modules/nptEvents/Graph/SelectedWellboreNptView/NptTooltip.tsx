import { NO_DEFINITION } from '../../components/constants';
import { NptCodeDefinitionType, NptView } from '../../types';
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
