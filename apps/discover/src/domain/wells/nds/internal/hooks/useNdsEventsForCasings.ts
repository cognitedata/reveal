import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { useNdsEventsQuery } from '../queries/useNdsEventsQuery';

export const useNdsEventsForCasings = ({ wellboreIds }: AllCursorsProps) => {
  const { data, isLoading } = useNdsEventsQuery({ wellboreIds });

  return useMemo(() => {
    if (!data) {
      return {
        data: {},
        isLoading,
      };
    }

    const eventsWithHoleStart = data.filter(
      ({ holeStart }) => !isUndefined(holeStart)
    );

    return {
      data: groupByWellbore(eventsWithHoleStart),
      isLoading,
    };
  }, [data, isLoading]);
};
