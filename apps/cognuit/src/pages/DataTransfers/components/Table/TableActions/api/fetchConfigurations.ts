import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import {
  reportError,
  reportSuccess,
  updateConfig,
  useDataTransfersDispatch,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { useContext } from 'react';
import { CustomError } from 'services/CustomError';
import { GenericResponseObject } from 'typings/interfaces';

export function useFetchConfigurations() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();

  return () => {
    api!.configurations
      .get()
      .then((response: GenericResponseObject[]) => {
        if (response.length > 0) {
          dispatch(updateConfig({ configurations: response }));
        } else {
          dispatch(updateConfig({ configurations: [] }));
        }
        dispatch(reportSuccess());
      })
      .catch((err: CustomError) => {
        dispatch(reportError(err));
        addError(err.message, err.status);
      });
  };
}
