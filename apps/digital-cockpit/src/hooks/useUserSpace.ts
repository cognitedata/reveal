import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { updateLastVisited } from 'store/userSpace/thunks';
import { now } from 'utils/date';
import { getLastVisited } from 'store/userSpace/selectors';
import { RootDispatcher } from 'store/types';

export const useLastVisited = (key: string) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const lastVisited = useSelector(getLastVisited) || [];

  const setAsLastvisited = () => {
    const filteredLastVisited = lastVisited.filter((item) => item.key !== key);
    dispatch(
      updateLastVisited(apiClient, [
        ...filteredLastVisited,
        {
          key,
          lastVisitedTime: now(),
        },
      ])
    );
  };
  return {
    setAsLastvisited,
  };
};
