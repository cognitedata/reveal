import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SingleCogniteCapability } from '@cognite/sdk';
import { RootState } from 'reducers/index';
import queryString from 'query-string';
import { History } from 'history';

import sdk, { getAuthState } from 'sdk-singleton';

// Constants
export type OnResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
  showSidebar?: boolean;
  eventId?: number;
  sequenceId?: number;
};

export const SET_APP_STATE = 'app/SET_APP_STATE';
export const CLEAR_APP_STATE = 'app/CLEAR_APP_STATE';

export interface SetAppStateAction extends Action<typeof SET_APP_STATE> {
  payload: {
    tenant?: string;
    cdfEnv?: string;
    groups?: { [key: string]: string[] };
    loaded?: boolean;
  };
}
interface ClearAppStateAction extends Action<typeof CLEAR_APP_STATE> {}

type AppAction = SetAppStateAction | ClearAppStateAction;

export function init(tenant: string) {
  return async (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    dispatch(setTenant(tenant));
    dispatch(fetchUserGroups());
  };
}

// selectors
export function isCogniteUser(): boolean {
  const { username } = getAuthState();

  return (
    username?.search(/cognite.com$/) !== -1 ||
    username?.search(/cognitedata.com$/) !== -1
  );
}

export const setTenant = (tenant: string) => async (
  dispatch: ThunkDispatch<any, any, SetAppStateAction>
) => {
  dispatch({
    type: SET_APP_STATE,
    payload: {
      tenant,
    },
  });
};

export const setCdfEnv = (env?: string) => async (
  dispatch: ThunkDispatch<any, any, SetAppStateAction>
) => {
  dispatch({
    type: SET_APP_STATE,
    payload: {
      cdfEnv: env,
    },
  });
};

const fetchUserGroups = () => async (
  dispatch: ThunkDispatch<any, any, SetAppStateAction>
) => {
  try {
    const response = await sdk.groups.list();

    const groups = response.reduce(
      (prev, current) => {
        const a = {
          ...prev,
        };
        // @ts-ignore
        const { capabilities, permissions } = current;
        if (permissions) {
          a.assetsAcl = (a.assetsAcl || []).concat(permissions.accessTypes);
          a.filesAcl = (a.filesAcl || []).concat(permissions.accessTypes);
          a.timeSeriesAcl = (a.timeSeriesAcl || []).concat(
            permissions.accessTypes
          );
        }
        if (capabilities) {
          capabilities.forEach((capability: SingleCogniteCapability) => {
            Object.keys(capability).forEach(key => {
              if (a[key]) {
                // @ts-ignore
                capability[key].actions.forEach(el => {
                  if (a[key].indexOf(el) === -1) {
                    a[key].push(el);
                  }
                });
              } else {
                // @ts-ignore
                a[key] = capability[key].actions;
              }
            });
          });
        }
        return a;
      },
      { groupsAcl: ['LIST'] } as { [key: string]: string[] }
    );

    dispatch({
      type: SET_APP_STATE,
      payload: {
        groups,
        loaded: true,
      },
    });
  } catch (e) {
    dispatch({
      type: SET_APP_STATE,
      payload: {
        loaded: true,
      },
    });
  }
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
  delete currentSearch.timeseriesId;
  delete currentSearch.fileId;
  delete currentSearch.sequenceId;
  delete currentSearch.eventId;

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

export interface LoginAction {
  (tenant: String): Promise<boolean>;
}

// Reducer
export interface AppState {
  tenant?: string;
  loaded: boolean;
  groups: { [key: string]: string[] };
  cdfEnv?: string;
}

const initialState: AppState = {
  loaded: false,
  groups: {},
};

export default function app(state = initialState, action: AppAction): AppState {
  switch (action.type) {
    case SET_APP_STATE:
      return { ...state, ...action.payload };
    case CLEAR_APP_STATE:
      return {
        ...state,
      };
    default:
      return state;
  }
}

// Selectors
export const selectAppState = (state: RootState) => state.app || {};

export const checkPermission = (state: RootState) => (
  key: string,
  type: string
) => {
  const { groups } = state.app || {};
  return (
    groups && groups.groupsAcl && groups[key] && groups[key].includes(type)
  );
};
