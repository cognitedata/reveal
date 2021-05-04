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
type ResourceSelectionProps = SelectionProps & { target: 'files' | 'assets' };

export default function ResourcesSelection(
  props: ResourceSelectionProps
): JSX.Element {
  const {
    target,
    filter,
    isSelectAll,
    selectedRowKeys,
    updateFilter,
    setSelectAll,
    setSelectedRowKeys,
  } = props;

  return (
    <Flex column style={{ paddingBottom: '50px' }}>
      <PageTitle>Select target: {target} (optional)</PageTitle>
      <SelectionBar type={target} filter={filter} updateFilter={updateFilter} />
      <SelectionTable
        type={target}
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        setSelectAll={setSelectAll}
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </Flex>
  );
}
