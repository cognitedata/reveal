import React, { useState } from 'react';

import { Colors } from '@cognite/cogs.js';

import { Flex, PageTitle } from '../../components/Common';
import { Filter } from '../../modules/sdk-builder/types';

import { SelectionBar, SelectionTable } from './components';

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

  const targetLabel =
    target === 'files' ? 'other engineering diagrams' : target;
  const targetSubtitleLabel = target === 'files' ? 'diagrams' : target;
  const targetSubtitle = `These ${targetSubtitleLabel} will be linked to all diagrams selected in the first step`;
  const [showSelected, setShowSelected] = useState<boolean>(false);

  return (
    <Flex column style={{ paddingBottom: '50px' }}>
      <PageTitle
        title={
          <>
            Link to {targetLabel}{' '}
            <span style={{ color: Colors['decorative--grayscale--500'] }}>
              (optional)
            </span>
          </>
        }
        subtitle={targetSubtitle}
      />
      <SelectionBar
        type={target}
        filter={filter}
        updateFilter={updateFilter}
        showSelected={showSelected}
        setShowSelected={setShowSelected}
      />
      <SelectionTable
        type={target}
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        setSelectAll={setSelectAll}
        setSelectedRowKeys={setSelectedRowKeys}
        showSelected={showSelected}
        data-testid="resources-selection-table"
      />
    </Flex>
  );
}
