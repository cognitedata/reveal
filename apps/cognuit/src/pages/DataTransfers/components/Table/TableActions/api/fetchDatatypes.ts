import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import {
  updateFilters,
  useDataTransfersDispatch,
  useDataTransfersState,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { useContext } from 'react';
import { CustomError } from 'services/CustomError';
import { DatatypesResponse } from 'types/ApiInterface';

export function useFetchDatatypes() {
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const dispatch = useDataTransfersDispatch();
  const {
    filters: { selectedSourceProject },
  } = useDataTransfersState();

  return () => {
    if (selectedSourceProject) {
      api!.datatypes
        .get(selectedSourceProject.id)
        .then((response: DatatypesResponse[]) => {
          dispatch(updateFilters({ datatypes: response }));
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    }
  };
}
