import { adaptNdsEventsToScatterView } from 'domain/wells/nds/internal/transformers/adaptNdsEventsToScatterView';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import { ScatterView, ScatterViewEvent } from 'components/ScatterView';
import { useDeepMemo } from 'hooks/useDeep';

interface Props {
  events: NdsInternal[];
  renderTooltipContent?: (event: ScatterViewEvent<NdsInternal>) => JSX.Element;
}

export const NdsEventsScatterView: React.FC<Props> = ({
  events,
  renderTooltipContent,
}) => {
  const processedEvents = useDeepMemo(
    () => adaptNdsEventsToScatterView(events),
    [events]
  );

  return (
    <ScatterView<NdsInternal>
      events={processedEvents}
      renderTooltipContent={renderTooltipContent}
    />
  );
};
