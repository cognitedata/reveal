import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as solutionsActions from '../redux/actions';

export const useSolutions = () => {
  const dispatch = useDispatch();

  const fetchSolutions = useCallback(() => {
    dispatch(solutionsActions.fetchSolutions());
  }, [dispatch]);

  return {
    fetchSolutions,
  };
};
