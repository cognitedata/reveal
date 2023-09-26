import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { actions as dataManagementActions } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { QueryFilter } from '@platypus-core/domain/data-model';

export const useFilter = () => {
  const dispatch = useDispatch();
  const setFilter = useCallback(
    (
      filter: QueryFilter | { [key in string]: QueryFilter } | null | undefined
    ) => {
      dispatch(dataManagementActions.setFilter(filter));
    },
    [dispatch]
  );

  return {
    setFilter,
  };
};
