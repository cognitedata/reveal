import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import {
  updateConfig,
  useDataTransfersDispatch,
  useDataTransfersState,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { useContext } from 'react';
import { CustomError } from 'services/CustomError';

export function useFetchDatatypes() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();
  const {
    config: { selectedSourceProject },
  } = useDataTransfersState();

  return () => {
    if (selectedSourceProject) {
      api!.datatypes
        .get(selectedSourceProject.id)
        .then((response: string[]) => {
          dispatch(updateConfig({ datatypes: response }));
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    }
  };
}
