import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';

import navigation from 'constants/navigation';
import { useDeepEffect } from 'hooks/useDeep';

import { wellInspectActions } from '../actions';
import {
  getInspectUrlSearchParams,
  getSearchParamValuesFromCurrentUrl,
} from '../inspectUrlHandler';
import { useWellInspectSelection } from '../selectors';

export const useInspectStateFromUrl = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const { selectedWellIds, selectedWellboreIds } = useWellInspectSelection();

  useDeepEffect(() => {
    const searchParams = getInspectUrlSearchParams({
      selectedWellIds,
      selectedWellboreIds,
    });

    if (searchParams) {
      history.replace({
        search: searchParams,
      });
    }
  }, [selectedWellIds, selectedWellboreIds, location.pathname]);

  useDeepEffect(() => {
    /**
     * If the user comes to inspect via search, well preview card, favorite, etc.
     * Then we just need to render the inspect views normally.
     */
    if (!isEmpty(selectedWellIds)) {
      return;
    }

    /**
     * If the user enters the inspect directly.
     * Then we should lookup the url search params.
     */
    const { wellIds, wellboreIds } = getSearchParamValuesFromCurrentUrl();

    /**
     * This will redirect the app to well search screen if there are no wellbores.
     * This is usable when user directly access the inspection screen
     * without any wells or wellbores included in the url search params.
     */
    if (isEmpty(wellboreIds)) {
      history.push(navigation.SEARCH_WELLS);
    }

    dispatch(
      wellInspectActions.setPrerequisiteData({
        wellIds,
        wellboreIds,
      })
    );
  }, []);
};
