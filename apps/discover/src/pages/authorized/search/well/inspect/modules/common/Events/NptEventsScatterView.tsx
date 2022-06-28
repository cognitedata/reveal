import { adaptNptEventsToScatterView } from 'domain/wells/npt/internal/transformers/adaptNptEventsToScatterView';
import { NptInternal } from 'domain/wells/npt/internal/types';

import { ScatterView } from 'components/ScatterView';
import { useDeepMemo } from 'hooks/useDeep';

interface Props {
  events: NptInternal[];
}

export const NptEventsScatterView: React.FC<Props> = ({ events }) => {
  const processedEvents = useDeepMemo(
    () => adaptNptEventsToScatterView(events),
    [events]
  );

  return <ScatterView events={processedEvents} />;
};
