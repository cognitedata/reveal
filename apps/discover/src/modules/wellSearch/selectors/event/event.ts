import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import { useMemo } from 'react';

import difference from 'lodash/difference';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';
import { log } from 'utils/log';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelection } from 'modules/wellInspect/selectors';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { useNptEventsQuery } from 'modules/wellSearch/hooks/useNptEventsQuery';
import { CogniteEventV3ish } from 'modules/wellSearch/types';
import {
  mapWellInfo,
  mapWellInfoToNPTEvents,
  mapWellInfoToNdsEvents,
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

    const events = ([] as CogniteEventV3ish[]).concat(...Object.values(data));
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

export const useNdsEvents = () => {
  const wells = useWellInspectSelectedWells();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data, isLoading } = useNdsEventsQuery();

  return useDeepMemo(() => {
    if (isLoading || !data) {
      return { isLoading, events: [] };
    }
    const events = mapWellInfoToNdsEvents(data, wells, userPreferredUnit);
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

export const useNdsEventsForCasings = () => {
  const { isLoading, events } = useNdsEvents();
  return useMemo(() => {
    const groupedEvents = groupBy(
      (events || []).filter((event) => event.metadata?.md_hole_start),
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
    () =>
      wellbores.map(
        (wellbore) => wellbore?.name || wellbore?.description || ''
      ),
    [wellbores]
  );
};
