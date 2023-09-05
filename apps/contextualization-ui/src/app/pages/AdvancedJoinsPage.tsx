import React, { createContext, useEffect, useState } from 'react';

import styled from 'styled-components';

import {
  useAdvancedJoin,
  getUrlParameters,
  useListMatches,
  useCurrentView,
} from '@fusion/contextualization';

import { FormattedContainer } from '../components/FormattedContainer';
import { InitialContextualizationScore } from '../components/InitialContextualizationScore';
import { UpdatedEstimatedScore } from '../components/UpdatedEstimatedScore';
import {
  MAX_COMPLETED_PERCENTAGE,
  NUM_MANUAL_MATCHES_TO_STATISTICALLY_SIGNIFICANT,
} from '../constants';
import { AdvancedJoinsTopBar } from '../containers/AdvancedJoinsTopBar';
import { Labeling } from '../containers/Labeling';
import { RunAdvancedJoin } from '../containers/RunAdvancedJoin';
import { EstimateArray, ManualMatch, SelectedColumns } from '../types';

export const ManualMatchesContext = createContext<{
  manualMatches: { [key: string]: ManualMatch };
  setManualMatches: React.Dispatch<
    React.SetStateAction<{ [key: string]: ManualMatch }>
  >;
}>({
  manualMatches: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function, lodash/prefer-noop
  setManualMatches: () => {},
});

export const AdvancedJoinsPage = () => {
  const { headerName } = getUrlParameters();

  const [isAdvancedJoinRunnable, setAdvancedJoinRunnable] =
    useState<boolean>(false);
  const [runStage, setRunStage] = useState<boolean>(false);
  const [manualMatches, setManualMatches] = useState<{
    [key: string]: ManualMatch;
  }>({});
  const [labelingStage, setLabelingStage] = useState<boolean>(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [estimateArray, setEstimateArray] = useState<EstimateArray[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, SelectedColumns>
  >({});

  // column managing utils
  const setFromColumn = (tableId: string, fromColumnNew: string) => {
    setSelectedColumns((prevSelectedColumns) => {
      return {
        ...prevSelectedColumns,
        [tableId]: {
          fromColumn: fromColumnNew,
          toColumn: prevSelectedColumns[tableId]?.toColumn || undefined,
        },
      };
    });
  };

  const setToColumn = (tableId: string, toColumnNew: string) => {
    setSelectedColumns((prevSelectedColumns) => {
      return {
        ...prevSelectedColumns,
        [tableId]: {
          fromColumn: prevSelectedColumns[tableId]?.fromColumn || undefined,
          toColumn: toColumnNew,
        },
      };
    });
  };

  const resetState = () => {
    setSelectedTable(null);
    setEstimateArray([]);
    setSelectedColumns({});
  };

  const getColumnsForTable = (tableId: string | null): SelectedColumns => {
    if (tableId === null) {
      return { fromColumn: undefined, toColumn: undefined };
    }
    return selectedColumns[tableId];
  };

  const view = useCurrentView();
  const { advancedJoin } = useAdvancedJoin(headerName, view);

  const {
    data: { items: savedManualMatches } = { items: [] },
    refetch: refetchManualMatchesList,
  } = useListMatches(advancedJoin?.externalId);
  const savedManualMatchesCount = savedManualMatches.length;

  const onClickStartLabeling = () => {
    setLabelingStage(true);
  };

  const completedPercentage = Math.min(
    Math.ceil(
      (savedManualMatchesCount * 100) /
        NUM_MANUAL_MATCHES_TO_STATISTICALLY_SIGNIFICANT
    ),
    MAX_COMPLETED_PERCENTAGE
  );

  useEffect(() => {
    setAdvancedJoinRunnable(completedPercentage === MAX_COMPLETED_PERCENTAGE);
  }, [completedPercentage, setAdvancedJoinRunnable]);

  return (
    <>
      <ManualMatchesContext.Provider
        value={{ manualMatches, setManualMatches }}
      >
        <AdvancedJoinsTopBar
          isAdvancedJoinRunnable={isAdvancedJoinRunnable}
          savedManualMatchesCount={savedManualMatchesCount}
          runStage={runStage}
          setRunStage={setRunStage}
        />
        <PageContainer>
          <FlexRow>
            <Column1>
              <InitialContextualizationScore
                headerName={headerName}
                advancedJoin={advancedJoin}
              />
            </Column1>

            {runStage ? (
              <>
                <Column2>
                  <RunAdvancedJoin
                    advancedJoinExternalId={advancedJoin?.externalId}
                    estimateArray={estimateArray}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    selectedDatabase={selectedDatabase}
                    setSelectedDatabase={setSelectedDatabase}
                    setFromColumn={setFromColumn}
                    setToColumn={setToColumn}
                    getColumnsForTable={getColumnsForTable}
                    resetState={resetState}
                  />
                </Column2>
                <Column1>
                  {selectedTable && selectedDatabase ? (
                    <UpdatedEstimatedScore
                      savedManualMatchesCount={savedManualMatchesCount}
                      selectedDatabase={selectedDatabase}
                      selectedTable={selectedTable}
                      advancedJoinExternalId={advancedJoin?.externalId}
                      estimateArray={estimateArray}
                      setEstimateArray={setEstimateArray}
                      getColumnsForTable={getColumnsForTable}
                    />
                  ) : (
                    <FormattedContainer
                      title="Estimated score after advanced join"
                      body={<>Select a table to join</>}
                      footer={<></>}
                    />
                  )}
                </Column1>
              </>
            ) : (
              <Column2>
                <Labeling
                  advancedJoinExternalId={advancedJoin?.externalId}
                  labelingStage={labelingStage}
                  onClickStartLabeling={onClickStartLabeling}
                  refetchManualMatchesList={refetchManualMatchesList}
                />
              </Column2>
            )}
          </FlexRow>
        </PageContainer>
      </ManualMatchesContext.Provider>
    </>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 106px);
  padding: 12px;
  background-color: #f5f5f5;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
`;

const Column1 = styled(Column)`
  flex: 1;
  max-width: 400px;
`;

const Column2 = styled(Column)`
  flex: 2;
  margin-right: 12px;
  margin-left: 12px;
  max-width: 100%;
  overflow-y: auto;
`;
