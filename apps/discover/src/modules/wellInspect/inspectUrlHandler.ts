import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import { getSearchParamsFromCurrentUrl } from 'utils/url/getSearchParamsFromCurrentUrl';
import { serializeParams } from 'utils/url/serializeParams';

import { BooleanSelection } from './types';

export const getInspectUrlSearchParams = ({
  selectedWellIds,
  selectedWellboreIds,
}: {
  selectedWellIds: BooleanSelection;
  selectedWellboreIds: BooleanSelection;
}) => {
  const selectedWellIdsArray = Object.keys(pickBy(selectedWellIds));
  const selectedWellboreIdsArray = Object.keys(pickBy(selectedWellboreIds));

  /**
   * If no any selected wellbores to inspect,
   * that means nothing has been selected to inspect.
   */
  if (isEmpty(selectedWellboreIdsArray)) {
    return null;
  }

  const params = {
    wells: selectedWellIdsArray.join(','),
    wellbores: selectedWellboreIdsArray.join(','),
  };

  return serializeParams(params);
};

export const getSearchParamValuesFromCurrentUrl = () => {
  const params = getSearchParamsFromCurrentUrl();

  /**
   * Added optional parameter checking for safety.
   * Sometimes the URL would not have the wells or wellbores params.
   * In that case, split is called on undefined.
   * This optional parameter prevents app from crashing.
   */
  return {
    wellIds: params.wells?.split(',') || [],
    wellboreIds: params.wellbores?.split(',') || [],
  };
};
