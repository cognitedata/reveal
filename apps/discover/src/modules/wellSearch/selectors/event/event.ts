import { useMemo } from 'react';

import difference from 'lodash/difference';
import groupBy from 'lodash/groupBy';
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

export const useNptEvents = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const userPrefferedUnit = useUserPreferencesMeasurement();
  const { data, isLoading } = useNptEventsQuery();

  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = mapWellInfoToNPTEvents(data, wells, userPrefferedUnit);
    return { isLoading: false, events };
  }, [JSON.stringify(Object.keys(data || {})), userPrefferedUnit]);
};

export const useNptEventsForCasings = () => {
  const { isLoading, events } = useNptEvents();
  return useMemo(() => {
    const groupedEvents = groupBy(
      (events || []).filter((event) => event.measuredDepth),
      'wellboreId'
    );
    return { isLoading, events: groupedEvents };
  }, [isLoading, events]);
};

export const useSelectedSecondaryWellboresWithoutNptData = () => {
  const { events, isLoading } = useNptEvents();
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
