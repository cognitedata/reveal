import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { updateLastVisited } from 'store/userSpace/thunks';
import { now } from 'utils/date';
import { getLastVisited } from 'store/userSpace/selectors';
import { Board, Suite } from 'store/suites/types';
import { RootDispatcher } from 'store/types';

export const useLastVisited = (dataItem: Board | Suite) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();
  const lastVisited = useSelector(getLastVisited) || [];

  const setAsLastvisited = () => {
    const filteredLastVisited = lastVisited.filter(
      (item) => item.key !== dataItem.key
    );
    dispatch(
      updateLastVisited(apiClient, [
        ...filteredLastVisited,
        {
          key: dataItem.key,
          lastVisitedTime: now(),
        },
      ])
    );
  };
  return {
    setAsLastvisited,
  };
};
