import { AllCursorsProps } from 'domain/wells/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { useNptEventsQuery } from '../queries/useNptEventsQuery';

export const useNptEventsForCasings = ({ wellboreIds }: AllCursorsProps) => {
  const { data, isLoading } = useNptEventsQuery({ wellboreIds });

  return useMemo(() => {
    if (!data) {
      return {
        data: {},
        isLoading,
      };
    }

    const eventsWithMeasuredDepth = data.filter(
      ({ measuredDepth }) => !isUndefined(measuredDepth)
    );

    return {
      data: groupByWellbore(eventsWithMeasuredDepth),
      isLoading,
    };
  }, [data, isLoading]);
};
