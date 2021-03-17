import { History } from 'history';
import queryString from 'query-string';
import { RootState } from 'store';
import { getAuthState } from 'sdk-singleton';
import { OnResourceSelectedParams } from '.';

export const selectAppState = (state: RootState) => state.app || {};

export const checkPermission = (acl: string, type: string) => (
  state: RootState
) => {
  const { groups } = state.app || {};
  return (
    groups && groups.groupsAcl && groups[acl] && groups[acl].includes(type)
  );
};

export const isCogniteUser = (): boolean => {
  const { username } = getAuthState();

  return (
    username?.search(/cognite.com$/) !== -1 ||
    username?.search(/cognitedata.com$/) !== -1
  );
};

export const onResourceSelected = (
  params: OnResourceSelectedParams,
  history: History,
  url?: string,
  shouldReplace = false
) => () => {
  const { search } = history.location;
  const currentSearch = queryString.parse(search);
  delete currentSearch.assetId;
  delete currentSearch.fileId;

  const newState = {
    ...currentSearch,
    ...params,
  };
  if (shouldReplace) {
    history.replace({
      ...(url && { pathname: url }),
      search: queryString.stringify(newState),
    });
  } else {
    history.push({
      ...(url && { pathname: url }),
      search: queryString.stringify(newState),
    });
  }
};
