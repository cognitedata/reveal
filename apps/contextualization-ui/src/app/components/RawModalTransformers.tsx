import { Dispatch, useEffect } from 'react';

import styled from 'styled-components';

import { EstimateArray } from '../types';

import DatabaseColumn from './DatabaseColumn';
import { TableColumn } from './TableColumn';

const RawTableSelection = ({
  selectedDatabase,
  setSelectedDatabase,
  setSelectedTable,
  selectedTable,
  estimateArray,
  resetState,
}: {
  selectedTable: string | null;
  setSelectedTable: Dispatch<React.SetStateAction<string | null>>;
  selectedDatabase: string | null;
  setSelectedDatabase: Dispatch<React.SetStateAction<string | null>>;
  estimateArray: EstimateArray[];
  resetState: () => void;
}): JSX.Element => {
  // Need to reset selected table when user clicks on a different database, otherwise we do calls to the API with the wrong database-table combinations
  useEffect(() => {
    setSelectedTable(null);
  }, [selectedDatabase, setSelectedTable]);

  const handleDatabaseSelect = (value: string) => {
    setSelectedDatabase(value);

    // side effects
    resetState();
  };

  return (
    <ColumnContainer>
      <DatabaseColumn
        onChange={handleDatabaseSelect}
        value={selectedDatabase}
      />
      {!!selectedDatabase && (
        <TableColumn
          estimateArray={estimateArray}
          database={selectedDatabase}
          setSelectedTable={setSelectedTable}
          selectedTable={selectedTable}
        />
      )}
    </ColumnContainer>
  );
};

const ColumnContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  min-height: 250px;
`;

export default RawTableSelection;
