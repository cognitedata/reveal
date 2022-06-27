import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';
import { log } from 'utils/log';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useNdsEventsQuery } from 'modules/wellSearch/hooks/useNdsEventsQuery';
import { CogniteEventV3ish } from 'modules/wellSearch/types';
import {
  mapWellInfo,
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
