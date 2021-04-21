import { RootDispatcher } from 'store/types';
import { ApiClient, CdfClient } from 'utils';
import { FILE_STORAGE_DATA_SET_ID } from 'constants/cdf';
import { setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';
import { setNotification } from 'store/notification/actions';
import * as actions from './actions';
import { ApplicationItem } from 'store/config/types';

export const getDataSet = (client: CdfClient) => async (
  dispatch: RootDispatcher
) => {
  try {
    const { id } = (await client.retrieveDataSet(FILE_STORAGE_DATA_SET_ID))[0];
    dispatch(actions.addConfigItems({ dataSetId: id }));
  } catch (e) {
    if (e.status === 400) {
      // if data set does not exist -> create it
      dispatch(createDataSet(client));
    } else {
      dispatch(
        setHttpError(
          `Failed to retrieve data set ${FILE_STORAGE_DATA_SET_ID}`,
          e
        )
      );
      Sentry.captureException(e);
    }
  }
};

function createDataSet(client: CdfClient) {
  return async (dispatch: RootDispatcher) => {
    try {
      const { id } = (await client.createDataSet(FILE_STORAGE_DATA_SET_ID))[0];
      dispatch(actions.addConfigItems({ dataSetId: id }));
      dispatch(setNotification(`Data set ${FILE_STORAGE_DATA_SET_ID} created`));
    } catch (e) {
      dispatch(
        setHttpError(
          `Failed to create a data set ${FILE_STORAGE_DATA_SET_ID}`,
          e
        )
      );
      Sentry.captureException(e);
    }
  };
}

export const getApplicationsList = (apiClient: ApiClient) => async (
  dispatch: RootDispatcher
) => {
  try {
    const applications = await apiClient.getApplications();
    dispatch(actions.addConfigItems({ applications }));
  } catch (e) {
    dispatch(setHttpError(`Failed to fetch applications list`, e));
    Sentry.captureException(e);
  }
};

export const saveApplicationsList = (
  apiClient: ApiClient,
  applicationKeys: string[]
) => async (dispatch: RootDispatcher) => {
  try {
    await apiClient.saveApplications(applicationKeys);
    dispatch(actions.addConfigItems({ applicationKeys }));
  } catch (e) {
    dispatch(setHttpError(`Failed to save applications list`, e));
    Sentry.captureException(e);
  }
};
