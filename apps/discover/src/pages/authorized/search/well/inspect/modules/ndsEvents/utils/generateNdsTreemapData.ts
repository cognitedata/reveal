import isEmpty from 'lodash/isEmpty';
import minBy from 'lodash/minBy';
import sumBy from 'lodash/sumBy';
import { getFixedPercent } from 'utils/number';

import { TreeMapData } from 'components/Treemap/Treemap';
import { Wellbore, WellboreEventsMap } from 'modules/wellSearch/types';

export const generateNdsTreemapData = (
  wellbores: Wellbore[],
  ndsEvents: WellboreEventsMap,
  maxNodes = 15
): TreeMapData => {
  let children: TreeMapData[];

  if (isEmpty(wellbores) || isEmpty(ndsEvents)) {
    children = [
      {
        title: 'No data',
        value: 100,
      },
    ];
  } else {
    // get as much data from one loop as possible
    const {
      numberOfWellsWithEvents,
      totalNumberOfEvents,
      wellbores: wellboresMapped,
    } = wellbores.reduce(
      (previousValue, currentValue) => {
        const numberOfEvents = ndsEvents[currentValue.id]?.length || 0;
        return {
          ...previousValue,
          totalNumberOfEvents:
            previousValue.totalNumberOfEvents + numberOfEvents,
          numberOfWellsWithEvents: numberOfEvents
            ? previousValue.numberOfWellsWithEvents + 1
            : previousValue.numberOfWellsWithEvents,
          wellbores: [
            ...previousValue.wellbores,
            { name: currentValue.name, numberOfEvents, id: currentValue.id },
          ],
        };
      },
      {
        totalNumberOfEvents: 0,
        numberOfWellsWithEvents: 0,
        wellbores: [] as { name: string; numberOfEvents: number }[],
      }
    );

    // sort wellbores by number of events
    const sortedWellboresWithEvents = [...wellboresMapped].sort(
      (a, b) => b.numberOfEvents - a.numberOfEvents
    );

    // get the number wellbores to be displayed
    const wellboresToDisplay = sortedWellboresWithEvents.slice(
      0,
      numberOfWellsWithEvents > maxNodes ? maxNodes : numberOfWellsWithEvents
    );
    const numberOfEventsFromDisplayedWellbores = sumBy(
      wellboresToDisplay,
      (data) => data.numberOfEvents
    );

    let OtherNode: TreeMapData | undefined;
    const minEvents = minBy(
      wellboresToDisplay,
      (data) => data.numberOfEvents
    )?.numberOfEvents;

    if (
      wellbores.length > wellboresToDisplay.length ||
      wellboresToDisplay.length === 0
    ) {
      OtherNode = {
        id: 'other',
        title: `Other (${wellbores.length - wellboresToDisplay.length})`,
        value: minEvents || 100,
        description: `${
          totalNumberOfEvents - numberOfEventsFromDisplayedWellbores
        } events (${getFixedPercent(
          totalNumberOfEvents - numberOfEventsFromDisplayedWellbores,
          totalNumberOfEvents
        )}%)`,
        wellbores: [...sortedWellboresWithEvents].slice(
          wellboresToDisplay.length,
          sortedWellboresWithEvents.length
        ),
      };
    }

    const realNodes = wellboresToDisplay.map((data) => ({
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
    title: 'Wellbore NDS treemap',
    children,
  };
};
