import { useMemo } from 'react';

import pickBy from 'lodash/pickBy';

import { CogniteEvent } from '@cognite/sdk';

import { log } from '_helpers/log';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { getDummyNptEventForWellbore } from 'modules/wellSearch/utils';
import {
  mapWellInfo,
  mapWellInfoToNPTEvents,
  convertTo3DNPTEvents,
} from 'modules/wellSearch/utils/events';

import {
  useSecondarySelectedOrHoveredWellbores,
  useSecondarySelectedOrHoveredWells,
  useSelectedSecondaryWellAndWellboreIds,
} from '../../selectors';

import { getConverFunctionForEvents } from './helper';

export const useNdsEventsForTable = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const { data, isLoading } = useNdsEventsQuery();
  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = ([] as CogniteEvent[]).concat(...Object.values(data));
    const errorList: string[] = [];
    const convertedEvents = mapWellInfo(events, wells).map(
      getConverFunctionForEvents('nds', (error) => errorList.push(error))
    );
    if (errorList.length > 0) {
      log('error occured while converting the units', errorList);
    }
    return { isLoading: false, events: convertedEvents };
  }, [data, wells]);
};

/**
 * TODO:
 * Better to merge both `useNptEventsForTable` and `useNptEventsForGraph` and create one hook.
 * Otherwise, the graph and table bahaves differently.
 * To sync their behavior, we should use one hook (eg: `useNptEvents` and use for both table and graph)
 */

export const useNptEventsForTable = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const { data, isLoading } = useNptEventsQuery();
  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = mapWellInfoToNPTEvents(data, wells);
    return { isLoading: false, events };
  }, [data]);
};

export const useNptEventsForGraph = () => {
  const { isLoading, events } = useNptEventsForSelectedSecondaryWellbores();
  const wellboresWithoutNptData = useSelectedSecondaryWellboresWithoutNptData();

  const dummyNptEvents = wellboresWithoutNptData.map((wellbore) =>
    getDummyNptEventForWellbore(wellbore)
  );

  return useMemo(() => {
    if (isLoading) return { isLoading, events: [] };
    return { isLoading, events: dummyNptEvents.concat(events) };
  }, [events, wellboresWithoutNptData]);
};

export const useNptEventsForSelectedSecondaryWellbores = () => {
  const { events: allEvents, isLoading } = useNptEventsForTable();
  const { selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();

  const selectedSecondaryWellboreIdsArray = Object.keys(
    pickBy(selectedSecondaryWellboreIds)
  );

  return useMemo(() => {
    if (isLoading) {
      return { isLoading, events: [] };
    }
    const events = allEvents.filter((event) =>
      selectedSecondaryWellboreIdsArray.includes(event.wellboreId.toString())
    );
    return { isLoading, events };
  }, [allEvents]);
};

export const useSelectedSecondaryWellboresWithoutNptData = () => {
  const { events, isLoading } = useNptEventsForTable();
  const selectedSecondaryWellbores = useSecondarySelectedOrHoveredWellbores();
  const { selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();
  const allWellboreIds = Object.keys(selectedSecondaryWellboreIds);

  return useMemo(() => {
    if (isLoading) return [];

    const wellboreIdsWithNptData = events.map((event) => event.wellboreId);
    const wellboreIdsWithoutNptData = allWellboreIds.filter(
      (wellboreId) => !wellboreIdsWithNptData.includes(Number(wellboreId))
    );

    return selectedSecondaryWellbores.filter((wellbore) =>
      wellboreIdsWithoutNptData.includes(wellbore.id.toString())
    );
  }, [isLoading, events]);
};

export const useNptEventsFor3D = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const { data, isLoading } = useNptEventsQuery();
  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = convertTo3DNPTEvents(data, wells);
    return { isLoading: false, events };
  }, [data]);
};
