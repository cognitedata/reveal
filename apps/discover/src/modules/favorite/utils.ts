import { LastUpdatedBy } from 'modules/favorite/types';
import { getFullNameOrDefaultText } from 'modules/user/utils';

const getFavoriteLastUpdateByUserName = (data: LastUpdatedBy[]) => {
  return getFullNameOrDefaultText(data[data.length - 1]);
};

const getFavoriteLastUpdatedByDateTime = (data: LastUpdatedBy[]) => {
  return data[data.length - 1]?.dateTime;
};

export { getFavoriteLastUpdateByUserName, getFavoriteLastUpdatedByDateTime };
