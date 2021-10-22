import { useMemo } from 'react';

import difference from 'lodash/difference';
import pickBy from 'lodash/pickBy';
import uniq from 'lodash/uniq';

import { CogniteEvent } from '@cognite/sdk';

import { log } from '_helpers/log';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import {
  useSecondarySelectedOrHoveredWellbores,
  useSecondarySelectedOrHoveredWells,
  useSelectedSecondaryWellAndWellboreIds,
} from 'modules/wellSearch//selectors';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { NPTEvent } from 'modules/wellSearch/types';
import { getDummyNptEventForWellbore } from 'modules/wellSearch/utils';
import {
  mapWellInfo,
  mapWellInfoToNPTEvents,
  convertTo3DNPTEvents,
} from 'modules/wellSearch/utils/events';

import { useGetConverFunctionForEvents } from './helper';

export const useNdsEventsForTable = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const userPrefferedUnit = useUserPreferencesMeasurement();
  const { data, isLoading } = useNdsEventsQuery();
  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const getConverFunctionsForEvents =
      useGetConverFunctionForEvents(userPrefferedUnit);
    const events = ([] as CogniteEvent[]).concat(...Object.values(data));
    const errorList: string[] = [];
    const convertedEvents = mapWellInfo(events, wells).map(
      getConverFunctionsForEvents('nds', (error) => errorList.push(error))
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
  const userPrefferedUnit = useUserPreferencesMeasurement();
  const { data, isLoading } = useNptEventsQuery();
  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = mapWellInfoToNPTEvents(data, wells, userPrefferedUnit);
    return { isLoading: false, events };
  }, [data, userPrefferedUnit]);
};

export const useNptEventsForGraph = () => {
  const { isLoading, events } = useNptEventsForSelectedSecondaryWellbores();
  const wellboresWithoutNptData = useSelectedSecondaryWellboresWithoutNptData();

  const dummyNptEvents = wellboresWithoutNptData.map((wellbore) =>
    getDummyNptEventForWellbore(wellbore)
  );

  return useMemo(() => {
    if (isLoading) return { isLoading, events: [] };
    return { isLoading, events: (events as NPTEvent[]).concat(dummyNptEvents) };
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

    const wellboreIdsWithNptData = uniq(
      events.map((event) => String(event.wellboreId))
    );
    const wellboreIdsWithoutNptData = difference(
      allWellboreIds,
      wellboreIdsWithNptData
    );

    return selectedSecondaryWellbores.filter((wellbore) =>
      wellboreIdsWithoutNptData.includes(String(wellbore.id))
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

export const useSecondarySelectedOrHoveredWellboreNames = () => {
  const wellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () => wellbores.map((wellbore) => wellbore.description || ''),
    [wellbores]
  );
};

export const useSelectedSecondaryWellboreNamesWithoutNptData = () => {
  const wellbores = useSelectedSecondaryWellboresWithoutNptData();
  return useMemo(
    () => wellbores.map((wellbore) => wellbore.description || ''),
    [wellbores]
  );
};
