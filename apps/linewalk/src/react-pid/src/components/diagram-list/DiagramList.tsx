import {
  Table,
  TableData,
  Title,
  Button,
  Select,
  TextInput,
} from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { Dispatch, useContext, useRef, useState } from 'react';
import styled from 'styled-components';

import SiteContext from '../../../../components/SiteContext/SiteContext';
import mapValueToOption from '../../../../utils/mapValueToOption';
import pickOnChangeOptionValue from '../../../../utils/pickOnChangeOptionValue';
import {
  DiagramsReducerAction,
  DiagramsReducerActionTypes,
} from '../../utils/diagramsReducer';

import { Overlay, ListContainer, ListHeader, ListFooter } from './elements';

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  > * {
    margin-right: 8px;
  }
  padding-bottom: 16px;
`;

const FilterContainer = styled.div`
  width: 500px;
`;

interface DiagramListProps {
  diagrams: FileInfo[];
  selectedUnparsedDiagrams: string[];
  dispatch: Dispatch<DiagramsReducerAction>;
}

interface DiagramTableData extends TableData {
  externalId: string;
  uploadedDate: string;
}

const useTableSelection = (dispatch: Dispatch<DiagramsReducerAction>) => {
  const selectedDiagrams = useRef<string[]>([]);

  const setSelection = (selection: TableData[]) => {
    const externalIds = selection.map((tableData) => tableData.externalId);
    selectedDiagrams.current = externalIds;
  };

  const dispatchSelection = () => {
    dispatch({
      type: DiagramsReducerActionTypes.SET_SELECTION_FOR_PARSING,
      externalIds: selectedDiagrams.current,
    });
  };

  return { setSelection, dispatchSelection };
};

const DiagramList = ({
  diagrams,
  selectedUnparsedDiagrams,
  dispatch,
}: DiagramListProps) => {
  const [search, setSearch] = useState('');

  const tableData: DiagramTableData[] = diagrams
    .filter((file) => file.name.toLowerCase().includes(search.toLowerCase()))
    .map((file) => ({
      id: file.id,
      externalId: file.externalId!,
      uploadedDate: file.lastUpdatedTime.toLocaleDateString(),
    }));

  const preSelected = selectedUnparsedDiagrams.reduce((record, externalId) => {
    // eslint-disable-next-line no-param-reassign
    record[externalId] = true;
    return record;
  }, {} as Record<string, boolean>);
  const { setUnit, unit, availableUnits } = useContext(SiteContext);
  const { setSelection, dispatchSelection } = useTableSelection(dispatch);

  const close = () => {
    dispatch({ type: DiagramsReducerActionTypes.TOGGLE_SHOW_LIST });
  };

  const confirm = () => {
    dispatchSelection();
    close();
  };

  const onRowClick = (row: any) => {
    // hacky cast to any as typings does not expose this method
    if (
      'toggleRowSelected' in row &&
      typeof row.toggleRowSelected === 'function'
    ) {
      row.toggleRowSelected();
    }
  };

  return (
    <Overlay>
      <ListContainer>
        <ListHeader>
          <Title level={4}>Select diagrams</Title>
          <Button type="ghost" icon="CloseLarge" onClick={close} />
        </ListHeader>
        <FiltersContainer>
          <FilterContainer>
            <Select
              title="Unit"
              value={mapValueToOption(unit)}
              onChange={pickOnChangeOptionValue(setUnit)}
              options={availableUnits.map(mapValueToOption)}
            />
          </FilterContainer>
          <FilterContainer>
            <TextInput
              placeholder="Search"
              icon="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              fullWidth
            />
          </FilterContainer>
        </FiltersContainer>
        <Table<DiagramTableData>
          columns={[
            { Header: 'Document name', accessor: 'externalId' },
            { Header: 'Date added', accessor: 'uploadedDate' },
          ]}
          dataSource={tableData}
          onSelectionChange={setSelection}
          rowKey={(row) => row.externalId}
          defaultSelectedIds={preSelected}
          selectorPosition="right"
          onRowClick={onRowClick}
        />
        <ListFooter>
          <Button type="primary" onClick={confirm}>
            Select
          </Button>
        </ListFooter>
      </ListContainer>
    </Overlay>
  );
};

export default DiagramList;
