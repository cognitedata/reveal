import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import {
  reportError,
  reportLoading,
  reportSuccess,
  updateConfig,
  useDataTransfersDispatch,
  useDataTransfersState,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { useContext } from 'react';
import { CustomError } from 'services/CustomError';

export function useFetchProjects() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();
  const {
    config: { selectedSource, selectedTarget },
  } = useDataTransfersState();

  return () => {
    dispatch(reportLoading());
    if (selectedSource) {
      api!.projects
        .get(selectedSource)
        .then((response) => {
          if (response.length > 0) {
            dispatch(updateConfig({ sourceProjects: response }));
          }
          dispatch(reportSuccess());
        })
        .catch((err: CustomError) => {
          dispatch(reportError(err));
          addError(err.message, err.status);
        });
    }
    if (selectedTarget) {
      api!.projects
        .get(selectedTarget)
        .then((response) => {
          if (response.length > 0) {
            dispatch(updateConfig({ targetProjects: response }));
            dispatch(reportSuccess());
          }
        })
        .catch((err: CustomError) => {
          dispatch(reportError(err));
          addError(err.message, err.status);
        });
    }
  };
}
