import { adaptNdsEventsToScatterView } from 'domain/wells/nds/internal/transformers/adaptNdsEventsToScatterView';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import { ScatterView } from 'components/ScatterView';
import { useDeepMemo } from 'hooks/useDeep';

interface Props {
  events: NdsInternal[];
}

export const NdsEventsScatterView: React.FC<Props> = ({ events }) => {
  const processedEvents = useDeepMemo(
    () => adaptNdsEventsToScatterView(events),
    [events]
  );

  return <ScatterView events={processedEvents} />;
};
