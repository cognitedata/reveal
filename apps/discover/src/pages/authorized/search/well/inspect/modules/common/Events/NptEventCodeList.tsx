import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';
import { adaptNptEventsToListView } from 'domain/wells/npt/internal/transformers/adaptNptEventsToListView';
import { NptInternal } from 'domain/wells/npt/internal/types';

import { NptCodeDefinition } from '../../events/Npt/NptCodeDefinition';
import { IconStyles } from '../../events/Npt/table/elements';
import { NptCodeDefinitionType } from '../../events/Npt/types';

import { EventsCodeCount, EventsCodeName, EventsCodeRow } from './elements';

export const NptEventCodeList: React.FC<{
  events: NptInternal[];
  nptCodeDefinitions: NptCodeDefinitionType;
}> = ({ events, nptCodeDefinitions }) => {
  const processedEvents = adaptNptEventsToListView(events);

  return (
    <>
      {Object.keys(processedEvents).map((event: string) => {
        const nptCodeDefinition = getCodeDefinition(event, nptCodeDefinitions);
        return (
          <EventsCodeRow key={event}>
            <EventsCodeName>{event}</EventsCodeName>
            <NptCodeDefinition
              nptCodeDefinition={nptCodeDefinition}
              iconStyle={IconStyles}
            />
            <EventsCodeCount>{processedEvents[event]}</EventsCodeCount>
          </EventsCodeRow>
        );
      })}
    </>
  );
};
