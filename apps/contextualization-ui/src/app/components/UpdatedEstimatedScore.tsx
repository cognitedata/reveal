import { Dispatch, SetStateAction, useEffect } from 'react';

import {
  getUrlParameters,
  useEstimateQuality,
} from '@fusion/contextualization';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

import { EstimateArray, JobStatus, SelectedColumns } from '../types';

import { EstimatedScoreBody } from './EstimatedScoreBody';
import { FormattedContainer } from './FormattedContainer';

export const UpdatedEstimatedScore = ({
  advancedJoinExternalId,
  selectedDatabase,
  selectedTable,
  savedManualMatchesCount,
  estimateArray,
  setEstimateArray,
  getColumnsForTable,
}: {
  selectedDatabase: string;
  selectedTable: string;
  savedManualMatchesCount: number;
  advancedJoinExternalId: string;
  estimateArray: EstimateArray[];
  setEstimateArray: Dispatch<SetStateAction<EstimateArray[]>>;
  getColumnsForTable: (tableId: string | null) => SelectedColumns;
}) => {
  const { headerName, type, space, versionNumber } = getUrlParameters();
  const { fromColumn, toColumn } = getColumnsForTable(selectedTable) || {};

  const existingEstimate = estimateArray.find(
    (e) => e.tableName === selectedTable && e.databaseName === selectedDatabase
  );

  const {
    estimateQualityJobStatus: status,
    contextualizationScorePercent: contextualizationScorePercent,
    estimatedCorrectnessScorePercent: estimatedCorrectnessScorePercent,
    confidencePercent: confidencePercent,
  } = useEstimateQuality(
    advancedJoinExternalId,
    selectedDatabase,
    selectedTable,
    fromColumn,
    toColumn
  );

  // Update estimateArray with the new job response
  useEffect(() => {
    if (status === JobStatus.Completed) {
      setEstimateArray((previousState: EstimateArray[]): EstimateArray[] => {
        const selectedIndex = previousState.findIndex(
          (estimate) =>
            estimate.tableName === selectedTable &&
            estimate.databaseName === selectedDatabase
        );
        if (selectedIndex === -1) {
          return [
            ...previousState,
            {
              status: status,
              tableName: selectedTable,
              databaseName: selectedDatabase,
              jobResponse: {
                contextualizationScorePercent:
                  contextualizationScorePercent,
                estimatedCorrectnessScorePercent:
                  estimatedCorrectnessScorePercent,
                confidencePercent: confidencePercent,
              },
            },
          ];
        }
        return previousState.map((estimate, index) => {
          if (selectedIndex !== undefined && selectedIndex === index) {
            return {
              status: status,
              tableName: selectedTable,
              databaseName: selectedDatabase,
              jobResponse: {
                contextualizationScorePercent:
                  contextualizationScorePercent,
                estimatedCorrectnessScorePercent:
                  estimatedCorrectnessScorePercent,
                confidencePercent: confidencePercent,
              },
            };
          }
          return estimate;
        });
      });
    }
  }, [
    contextualizationScorePercent,
    estimatedCorrectnessScorePercent,
    confidencePercent,
    selectedDatabase,
    selectedTable,
    setEstimateArray,
    status,
  ]);

  useEffect(() => {
    if (status === JobStatus.Failed) {
      setEstimateArray((previousState) => {
        const newState = [...previousState]; // copy of the previous state
        const index = newState.findIndex(
          (t) =>
            t.tableName === selectedTable && t.databaseName === selectedDatabase
        ); // find the table object in the array
        // if table exists in the array, update its properties
        if (index !== -1) {
          newState[index] = {
            ...newState[index],
            status: JobStatus.Failed,
          };
        }
        return newState;
      });
    }
  }, [
    status,
    contextualizationScorePercent,
    estimatedCorrectnessScorePercent,
    confidencePercent,
    selectedTable,
    setEstimateArray,
    selectedDatabase,
  ]);

  const title = 'Estimated score after advanced join';

  const body = (
    <>
      {existingEstimate ? (
        <EstimatedScoreBody
          savedManualMatchesCount={savedManualMatchesCount}
          jobState={status}
          headerName={headerName}
          estimateArray={existingEstimate}
        />
      ) : estimateArray.find(
          (e) =>
            e.tableName === selectedTable && e.databaseName === selectedDatabase
        )?.status === JobStatus.Completed ? (
        <EstimatedScoreBody
          savedManualMatchesCount={savedManualMatchesCount}
          jobState={status}
          headerName={headerName}
          estimateArray={estimateArray.find(
            (e) =>
              e.tableName === selectedTable &&
              e.databaseName === selectedDatabase
          )}
        />
      ) : (
        <Spinner />
      )}
    </>
  );

  const footer = <></>;

  return <FormattedContainer title={title} body={body} footer={footer} />;
};
