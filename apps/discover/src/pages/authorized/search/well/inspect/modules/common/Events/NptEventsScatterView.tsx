import { adaptNptEventsToScatterView } from 'domain/wells/npt/internal/transformers/adaptNptEventsToScatterView';
import { NptInternal } from 'domain/wells/npt/internal/types';

import { ScatterView, ScatterViewEvent } from 'components/ScatterView';
import { useDeepMemo } from 'hooks/useDeep';

interface Props {
  events: NptInternal[];
  renderTooltipContent?: (event: ScatterViewEvent<NptInternal>) => JSX.Element;
}

export const NptEventsScatterView: React.FC<Props> = ({
  events,
  renderTooltipContent,
}) => {
  const processedEvents = useDeepMemo(
    () => adaptNptEventsToScatterView(events),
    [events]
  );

  return (
    <ScatterView<NptInternal>
      events={processedEvents}
      renderTooltipContent={renderTooltipContent}
    />
  );
};
