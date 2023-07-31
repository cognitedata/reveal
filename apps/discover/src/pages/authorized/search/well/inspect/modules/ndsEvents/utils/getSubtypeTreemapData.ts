import { groupBySubtype } from 'domain/wells/nds/internal/transformers/groupBySubtype';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import isEmpty from 'lodash/isEmpty';
import minBy from 'lodash/minBy';
import sumBy from 'lodash/sumBy';
import { getFixedPercent } from 'utils/number';

import { TreeMapData } from 'components/Treemap';

import { MORE_NODE_ID } from '../components/DetailedView';

export const getSubtypeTreemapData = (
  ndsEvents: NdsInternal[],
  maxNodes = 15
): TreeMapData => {
  let children: TreeMapData[];

  const groupedNdsEvents = groupBySubtype(ndsEvents);
  const numberOfSubtypes = Object.keys(groupedNdsEvents).length;

  if (isEmpty(ndsEvents)) {
    children = [
      {
        title: 'No data',
        value: 100,
      },
    ];
  } else {
    // get as much data from one loop as possible
    const {
      totalNumberOfEvents,
      events: eventsMapped,
      numberOfSubtypesWithEvents,
    } = Object.keys(groupedNdsEvents).reduce(
      (previousValue, subtype) => {
        const numberOfEvents = groupedNdsEvents[subtype].length;

        return {
          ...previousValue,
          totalNumberOfEvents:
            previousValue.totalNumberOfEvents + numberOfEvents,
          numberOfSubtypesWithEvents: numberOfEvents
            ? previousValue.numberOfSubtypesWithEvents + 1
            : previousValue.numberOfSubtypesWithEvents,
          events: [
            ...previousValue.events,
            {
              name: subtype,
              numberOfEvents,
            },
          ],
        };
      },
      {
        totalNumberOfEvents: 0,
        numberOfSubtypesWithEvents: 0,
        events: [] as { name: string; numberOfEvents: number }[],
      }
    );

    // sort wellbores by number of events
    const sortedEventsWithSubtype = [...eventsMapped].sort(
      (a, b) => b.numberOfEvents - a.numberOfEvents
    );

    // get the number wellbores to be displayed
    const subtypesToDisplay = sortedEventsWithSubtype.slice(
      0,
      numberOfSubtypesWithEvents > maxNodes
        ? maxNodes
        : numberOfSubtypesWithEvents
    );
    const numberOfEventsFromDisplayedSubtypes = sumBy(
      subtypesToDisplay,
      (data) => data.numberOfEvents
    );

    let OtherNode: TreeMapData | undefined;
    const minEvents = minBy(
      subtypesToDisplay,
      (data) => data.numberOfEvents
    )?.numberOfEvents;

    if (
      numberOfSubtypes > subtypesToDisplay.length ||
      subtypesToDisplay.length === 0
    ) {
      OtherNode = {
        id: MORE_NODE_ID,
        title: `More (${numberOfSubtypes - subtypesToDisplay.length})`,
        value: minEvents || 100,
        description: `${
          totalNumberOfEvents - numberOfEventsFromDisplayedSubtypes
        } events (${getFixedPercent(
          totalNumberOfEvents - numberOfEventsFromDisplayedSubtypes,
          totalNumberOfEvents
        )}%)`,
        subtypes: [...sortedEventsWithSubtype].slice(
          subtypesToDisplay.length,
          sortedEventsWithSubtype.length
        ),
      };
    }

    const realNodes = subtypesToDisplay.map((data) => ({
      title: data.name,
      description: `${data.numberOfEvents} events (${getFixedPercent(
        data.numberOfEvents,
        totalNumberOfEvents
      )}%)`,
      value: data.numberOfEvents,
    }));

    children = OtherNode ? [...realNodes, OtherNode] : realNodes;
  }

  return {
    title: 'NDS Subtype treemap',
    children,
  };
};
