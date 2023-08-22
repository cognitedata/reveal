import { Dispatch, useEffect } from 'react';

import { useRunAdvancedJoin } from '@fusion/contextualization';

import { Button, toast, Tooltip } from '@cognite/cogs.js';

import { FormattedContainer } from '../components/FormattedContainer';
import RawTableSelection from '../components/RawModalTransformers';
import { SelectedTable, SelectedTableProps } from '../components/SelectedTable';
import { useUpdateAdvancedJoinObject } from '../hooks/useUpdateAdvancedJoinObject';
import { EstimateArray, JobStatus, SelectedColumns } from '../types';

export const RunAdvancedJoin = (props: {
  advancedJoinExternalId: string;
  selectedTable: string | null;
  setSelectedTable: Dispatch<React.SetStateAction<string | null>>;
  selectedDatabase: string | null;
  setSelectedDatabase: Dispatch<React.SetStateAction<string | null>>;
  estimateArray: EstimateArray[];
  setFromColumn: (tableId: string, fromColumnNew: string) => void;
  setToColumn: (tableId: string, toColumnNew: string) => void;
  getColumnsForTable: (tableId: string | null) => SelectedColumns;
  resetState: () => void;
}) => {
  const {
    selectedTable,
    selectedDatabase,
    advancedJoinExternalId,
    getColumnsForTable,
  } = props;
  const { fromColumn, toColumn } = getColumnsForTable(selectedTable) || {};
  const { invokeUpdateAdvancedJoinObject } = useUpdateAdvancedJoinObject();

  const { runAdvancedJoinJobStatus, invokeRunJob } = useRunAdvancedJoin();

  const handleWriteMatchers = () => {
    invokeUpdateAdvancedJoinObject(
      advancedJoinExternalId,
      selectedDatabase,
      selectedTable,
      fromColumn,
      toColumn
    );
    setTimeout(() => {
      invokeRunJob(advancedJoinExternalId);
    }, 100);
  };

  useEffect(() => {
    if (runAdvancedJoinJobStatus === JobStatus.Failed) {
      toast.error('Write matches to Data Model Failed');
    }
    if (runAdvancedJoinJobStatus === JobStatus.Completed) {
      toast.success('Write matches to Data Model Completed');
    }
  }, [runAdvancedJoinJobStatus]);

  const writingData = runAdvancedJoinJobStatus === JobStatus.Running;

  return (
    <FormattedContainer
      title="Calculate contextualization scores and run advanced join"
      body={
        <>
          <p>
            Before running the advanced join, you need to select the RAW table
            that should be written back to the flexible data model you came
            from.
          </p>
          <p>
            The RAW table will typically be the output of an entity matching job
            or a similar matching process with some uncertainty.
          </p>
          <p>
            The manual matches are used to calculate the score based on the
            overlap from the specific RAW tables.
          </p>

          <RawTableSelection {...props} />

          {selectedTable !== null && selectedDatabase && (
            <>
              <SelectedTable {...(props as SelectedTableProps)} />
            </>
          )}
        </>
      }
      footer={
        <div>
          <Tooltip
            position="bottom"
            content="Use Advanced Join to populate your data model with matches"
          >
            <Button
              onClick={handleWriteMatchers}
              type="primary"
              icon={writingData ? 'Loader' : undefined}
            >
              Write matches to Data Model
            </Button>
          </Tooltip>
        </div>
      }
    />
  );
};
