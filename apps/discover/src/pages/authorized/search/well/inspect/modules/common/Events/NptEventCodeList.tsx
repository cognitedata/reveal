import { getCodeDefinition } from 'dataLayers/wells/npt/selectors/getCodeDefinition';
import groupBy from 'lodash/groupBy';

import { NPTEvent } from 'modules/wellSearch/types';

import { NptCodeDefinition } from '../../events/Npt/NptCodeDefinition';
import { IconStyles } from '../../events/Npt/table/elements';
import { NptCodeDefinitionType } from '../../events/Npt/types';

import { EventsCodeCount, EventsCodeName, EventsCodeRow } from './elements';

export const NptEventCodeList: React.FC<{
  events: NPTEvent[];
  nptCodeDefinitions: NptCodeDefinitionType;
}> = ({ events, nptCodeDefinitions }) => {
  const groupedEvents = groupBy(events, 'nptCode');

  return (
    <>
      {Object.keys(groupedEvents).map((code) => {
        const nptCodeDefinition = getCodeDefinition(code, nptCodeDefinitions);
        return (
          <EventsCodeRow key={code}>
            <EventsCodeName>{code}</EventsCodeName>
            <NptCodeDefinition
              nptCodeDefinition={nptCodeDefinition}
              iconStyle={IconStyles}
            />
            <EventsCodeCount>{groupedEvents[code].length}</EventsCodeCount>
          </EventsCodeRow>
        );
      })}
    </>
  );
};
