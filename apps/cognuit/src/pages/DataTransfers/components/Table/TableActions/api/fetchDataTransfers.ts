import { useContext } from 'react';
import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import set from 'date-fns/set';
import { format } from 'date-fns';
import {
  initialState,
  reportLoading,
  reportSuccess,
  useDataTransfersDispatch,
  useDataTransfersState,
} from 'pages/DataTransfers/context/DataTransfersContext';
import { DataTransferObject, RESTTransfersFilter } from 'typings/interfaces';
import { DataTransfersResponse } from 'types/ApiInterface';
import { Action, DataTypesTableData } from 'pages/DataTransfers/types';
import { selectColumns } from 'pages/DataTransfers/utils';
import { CustomError } from 'services/CustomError';

import config from '../../../../datatransfer.config';

// TODO_: MAKE THIS A MAP?!
function getColumnNames(dataTransferObjects: DataTransferObject[]): string[] {
  const results: string[] = [];
  if (dataTransferObjects.length > 0) {
    Object.keys(dataTransferObjects[0]).forEach((k) => {
      results.push(k);
    });
  }
  return results;
}

export function useFetchDataTransfers() {
  const dispatch = useDataTransfersDispatch();
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const {
    data,
    filters: {
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      selectedSourceProject,
      selectedTargetProject,
      selectedDateRange,
      selectedDatatype,
    },
  } = useDataTransfersState();

  return () => {
    if (
      selectedConfiguration ||
      (selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject)
    ) {
      dispatch(reportLoading());
      let options: RESTTransfersFilter = {};
      if (
        selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject
      ) {
        options = {
          source: {
            source: selectedSource,
            external_id: selectedSourceProject.external_id,
          },
          target: {
            source: selectedTarget,
            external_id: selectedTargetProject.external_id,
          },
        };
      }
      if (selectedDateRange) {
        let { startDate, endDate } = selectedDateRange;
        if (startDate && endDate) {
          startDate = set(startDate, { hours: 0, minutes: 0, seconds: 0 });
          endDate = set(endDate, { hours: 23, minutes: 59, seconds: 59 });
          options.updated_after = Number(format(startDate, 't'));
          options.updated_before = Number(format(endDate, 't'));
        }
      }
      if (selectedConfiguration) {
        options.configuration = selectedConfiguration.name;
      }
      if (selectedDatatype) {
        options.datatypes = [selectedDatatype];
      }
      api!.datatransfers
        .get(options)
        .then((response: DataTransfersResponse[]) => {
          if (response.length > 0) {
            const handledData: DataTypesTableData[] = response.map((item) => ({
              ...item.source,
              status: item.status,
              report: item.status,
            }));

            dispatch({
              type: Action.SUCCEED,
              payload: {
                data: handledData,
                columns: selectColumns(
                  handledData.length > 0 ? handledData : data.data,
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames
                ),
                rawColumns: selectColumns(
                  handledData.length > 0 ? handledData : data.data,
                  []
                ),
                allColumnNames: getColumnNames(
                  handledData.length > 0 ? handledData : data.data
                ),
                selectedColumnNames:
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames,
              },
            });
          } else {
            dispatch(
              reportSuccess({
                ...initialState.data,
                columns: selectColumns(
                  data.data,
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames
                ),
                rawColumns: selectColumns(data.data, []),
                allColumnNames: getColumnNames(data.data),
                selectedColumnNames:
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames,
              })
            );
          }
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
          dispatch({ type: Action.FAIL, error: err });
        });
    }
  };
}
