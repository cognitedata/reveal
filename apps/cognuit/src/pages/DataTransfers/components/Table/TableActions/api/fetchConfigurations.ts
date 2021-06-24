import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import {
  reportError,
  reportSuccess,
  updateFilters,
  useDataTransfersDispatch,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { useContext } from 'react';
import { CustomError } from 'services/CustomError';
import { ConfigurationsResponse } from 'types/ApiInterface';

export function useFetchConfigurations() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();

  return () => {
    api!.configurations
      .get()
      .then((response: ConfigurationsResponse[]) => {
        if (response.length > 0) {
          dispatch(updateFilters({ configurations: response }));
        } else {
          dispatch(updateFilters({ configurations: [] }));
        }
        dispatch(reportSuccess());
      })
      .catch((err: CustomError) => {
        dispatch(reportError(err));
        addError(err.message, err.status);
      });
  };
}
