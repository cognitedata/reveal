import React from 'react';
import { Filter } from 'modules/sdk-builder/types';
import { Flex, PageTitle } from 'components/Common';
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

  return (
    <Flex column style={{ paddingBottom: '50px' }}>
      <PageTitle>Select diagrams you want to contextualize</PageTitle>
      <SelectionBar type="files" filter={filter} updateFilter={updateFilter} />
      <SelectionTable
        type="files"
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        setSelectAll={setSelectAll}
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </Flex>
  );
}
