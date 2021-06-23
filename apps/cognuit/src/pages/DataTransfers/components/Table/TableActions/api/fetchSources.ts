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
import { SourcesResponse } from 'types/ApiInterface';

export function useFetchSources() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();

  return () => {
    api!.sources
      .get()
      .then((response: SourcesResponse) => {
        dispatch(updateConfig({ sources: response }));
        dispatch(reportSuccess());
      })
      .catch((err: CustomError) => {
        addError(err.message, err.status);
        dispatch(reportError(err));
      });
  };
}
