import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CdfClientContext } from 'providers/CdfClientProvider';
// TODO(DTC-222)
// import { ApiClientContext } from 'providers/ApiClientProvider';
import {
  updateLastVisitedCdf,

  // updateLastVisited,
} from 'store/userSpace/thunks';
import { now } from 'utils/date';
import { getUserId } from 'store/auth/selectors';
import { getLastVisited } from 'store/userSpace/selectors';
import { Board } from 'store/suites/types';
import { RootDispatcher } from 'store/types';

export const useLastVisited = (dataItem: Board) => {
  // TODO(DTC-222)
  // const apiClient = useContext(ApiClientContext);
  const dispatch = useDispatch<RootDispatcher>();

  const client = useContext(CdfClientContext);
  const userId = useSelector(getUserId);
  const lastVisited = useSelector(getLastVisited) || [];
  const filteredLastVisited = lastVisited.filter(
    (item) => item.key !== dataItem.key
  );
  const setAsLastvisited = () => {
    dispatch(
      updateLastVisitedCdf(client, userId, [
        ...filteredLastVisited,
        { key: dataItem.key, lastVisitedTime: now() },
      ])
    );
    // TODO(DTC-222)
    // dispatch(
    //   updateLastVisited(apiClient, {
    //     key: dataItem.key,
    //     lastVisitedTime: now(),
    //   })
    // );
  };
  return {
    setAsLastvisited,
  };
};
