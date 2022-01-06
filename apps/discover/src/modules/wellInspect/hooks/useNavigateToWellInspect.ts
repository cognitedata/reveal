import { batch, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import navigation from 'constants/navigation';
import { WellboreId, WellId } from 'modules/wellSearch/types';

import { wellInspectActions } from '../actions';

export const useNavigateToWellInspect = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  return ({
    wellIds,
    wellboreIds,
  }: {
    wellIds: WellId[];
    wellboreIds: WellboreId[];
  }) => {
    batch(() => {
      dispatch(wellInspectActions.setGoBackNavigationPath(location.pathname));
      dispatch(
        wellInspectActions.setPrerequisiteData({
          wellIds,
          wellboreIds,
        })
      );
    });

    history.push(navigation.SEARCH_WELLS_INSPECT);
  };
};
