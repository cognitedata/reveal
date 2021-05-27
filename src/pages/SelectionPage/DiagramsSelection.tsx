import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Filter } from 'modules/sdk-builder/types';
import {
  loadWorkflowDiagrams,
  getActiveWorkflowItems,
} from 'modules/workflows';
import { Flex, PageTitle } from 'components/Common';
import { useActiveWorkflow } from 'hooks';
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
  const dispatch = useDispatch();
  const { workflowId } = useActiveWorkflow();
  const {
    filter,
    isSelectAll,
    selectedRowKeys,
    updateFilter,
    setSelectAll,
    setSelectedRowKeys,
  } = props;
  const [diagramToContextualizeId, setDiagramToContextualizeId] = useState();
  const [
    diagramToContextualizeLoaded,
    setDiagramToContextualizeLoaded,
  ] = useState(false);
  const { diagrams = undefined } = useSelector(getActiveWorkflowItems);

  const fetchUserSelectedDiagram = () => {
    const isParticularDiagramEdited =
      diagrams &&
      diagrams.type === 'files' &&
      diagrams.endpoint === 'retrieve' &&
      diagrams.filter.length === 1;
    if (isParticularDiagramEdited && !diagramToContextualizeLoaded) {
      setDiagramToContextualizeId(diagrams?.filter?.[0]?.id);
    }
  };

  useEffect(() => {
    fetchUserSelectedDiagram();
    // we want this to happen only on mount
    // otherwise the first selected file will be treated as "edited" one
    // and be shifted to beginning of the page for no reason
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      workflowId &&
      diagramToContextualizeId &&
      !diagramToContextualizeLoaded
    ) {
      dispatch(loadWorkflowDiagrams({ workflowId, loadAll: true }));
      setDiagramToContextualizeLoaded(true);
    }
  }, [
    dispatch,
    workflowId,
    diagramToContextualizeId,
    diagramToContextualizeLoaded,
  ]);

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
        diagramToContextualizeId={diagramToContextualizeId}
      />
    </Flex>
  );
}
