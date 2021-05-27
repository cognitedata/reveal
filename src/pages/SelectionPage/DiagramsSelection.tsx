import React from 'react';
import { useSelector } from 'react-redux';
import { Filter } from 'modules/sdk-builder/types';
import { Flex, PageTitle } from 'components/Common';
import { getActiveWorkflowItems } from 'modules/workflows';
import SelectionBar from './components/SelectionBar';
import SelectionTable from './components/SelectionTable';

type SelectionProps = {
  filter: Filter;
  isSelectAll: boolean;
  selectedRowKeys: number[];
  updateFilter: (f: any) => void;
  setSelectAll: (isSelectAll: boolean) => void;
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
};

export default function DiagramsSelection(props: SelectionProps): JSX.Element {
  const {
    filter,
    isSelectAll,
    selectedRowKeys,
    updateFilter,
    setSelectAll,
    setSelectedRowKeys,
  } = props;
  const { diagrams = undefined } = useSelector(getActiveWorkflowItems);
  const isParticularDiagramEdited =
    diagrams &&
    diagrams.type === 'files' &&
    diagrams.endpoint === 'retrieve' &&
    diagrams.filter.length === 1;
  const editedDiagramId = isParticularDiagramEdited
    ? diagrams?.filter?.[0]?.id
    : undefined;

  return (
    <Flex column style={{ paddingBottom: '50px' }}>
      <PageTitle>Select engineering diagrams</PageTitle>
      <SelectionBar
        type="files"
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        updateFilter={updateFilter}
      />
      <SelectionTable
        type="files"
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        setSelectAll={setSelectAll}
        setSelectedRowKeys={setSelectedRowKeys}
        editedDiagramId={editedDiagramId}
      />
    </Flex>
  );
}
