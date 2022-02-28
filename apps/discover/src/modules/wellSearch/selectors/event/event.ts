import { useMemo } from 'react';

import difference from 'lodash/difference';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import { log } from 'utils/log';

import { CogniteEvent } from '@cognite/sdk';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import {
  useWellInspectSelectedWellbores,
  useWellInspectSelectedWells,
} from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectSelection } from 'modules/wellInspect/selectors';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import {
  mapWellInfo,
  mapWellInfoToNPTEvents,
} from 'modules/wellSearch/utils/events';

import { useGetConvertFunctionForEvents } from './helper';

export const useNdsEventsForTable = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data, isLoading } = useNdsEventsQuery();
  const getConvertFunctionsForEvents =
    useGetConvertFunctionForEvents(userPreferredUnit);

  return useMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }

    const events = ([] as CogniteEvent[]).concat(...Object.values(data));
    const errorList: string[] = [];
    const convertedEvents = mapWellInfo(events, wells).map(
      getConvertFunctionsForEvents('nds', (error) => errorList.push(error))
    );
    if (errorList.length > 0) {
      log('error occured while converting the units', errorList);
    }
    return { isLoading: false, events: convertedEvents };
  }, [data, isLoading, wells, getConvertFunctionsForEvents]);
};

export const useNptEvents = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data, isLoading } = useNptEventsQuery();

  return useDeepMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = mapWellInfoToNPTEvents(data, wells, userPreferredUnit);
    return { isLoading: false, events };
  }, [data, userPreferredUnit]);
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
  const selectedInspectWellbores = useWellInspectSelectedWellbores();
  const { selectedWellboreIds } = useWellInspectSelection();
  const allWellboreIds = Object.keys(selectedWellboreIds);

  return useMemo(() => {
    if (isLoading) return [];

    const wellboreIdsWithNptData = uniq(
      events.map((event) => String(event.wellboreId))
    );
    const wellboreIdsWithoutNptData = difference(
      allWellboreIds,
      wellboreIdsWithNptData
    );

    return selectedInspectWellbores.filter((wellbore) =>
      wellboreIdsWithoutNptData.includes(String(wellbore.id))
    );
  }, [isLoading, events]);
};

export const useSelectedSecondaryWellboreNamesWithoutNptData = () => {
  const wellbores = useSelectedSecondaryWellboresWithoutNptData();
  return useMemo(
    () => wellbores.map((wellbore) => wellbore.description || ''),
    [wellbores]
  );
};
