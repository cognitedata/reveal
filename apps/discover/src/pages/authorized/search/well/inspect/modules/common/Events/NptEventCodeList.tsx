import { adaptNptEventsToListView } from 'domain/wells/npt/internal/adapters/adaptNptEventsToListView';
import { getCodeDefinition } from 'domain/wells/npt/internal/selectors/getCodeDefinition';

import { NPTEvent } from 'modules/wellSearch/types';

import { NptCodeDefinition } from '../../events/Npt/NptCodeDefinition';
import { IconStyles } from '../../events/Npt/table/elements';
import { NptCodeDefinitionType } from '../../events/Npt/types';

import { EventsCodeCount, EventsCodeName, EventsCodeRow } from './elements';

export const NptEventCodeList: React.FC<{
  events: NPTEvent[];
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
