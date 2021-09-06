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
  const [showSelected, setShowSelected] = useState<boolean>(false);

  const { workflowId } = useActiveWorkflow();
  const {
    filter,
    isSelectAll,
    selectedRowKeys,
    updateFilter,
    setSelectAll,
    setSelectedRowKeys,
  } = props;
  const [diagramsToContextualizeIds, setDiagramsToContextualizeIds] = useState<
    number[]
  >([]);
  const [diagramsToContextualizeLoaded, setDiagramsToContextualizeLoaded] =
    useState(false);
  const { diagrams = undefined } = useSelector(getActiveWorkflowItems);

  const fetchUserSelectedDiagrams = () => {
    const isParticularDiagramEdited =
      diagrams && diagrams.type === 'files' && diagrams.endpoint === 'retrieve';
    if (!isParticularDiagramEdited) setDiagramsToContextualizeIds([]);
    if (isParticularDiagramEdited && !diagramsToContextualizeLoaded) {
      const diagramsIds = diagrams?.filter?.map(
        (diagram: { id: number }) => diagram.id
      );
      setDiagramsToContextualizeIds(diagramsIds);
    }
  };

  useEffect(() => {
    fetchUserSelectedDiagrams();
    // we want this to happen only on mount or on diagrams change
    // otherwise the first selected file will be treated as "edited" one
    // and be shifted to beginning of the page for no reason
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagrams]);

  useEffect(() => {
    if (
      workflowId &&
      diagramsToContextualizeIds?.length &&
      !diagramsToContextualizeLoaded
    ) {
      dispatch(loadWorkflowDiagrams({ workflowId, loadAll: true }));
      setDiagramsToContextualizeLoaded(true);
    }
  }, [
    dispatch,
    workflowId,
    diagramsToContextualizeIds,
    diagramsToContextualizeLoaded,
  ]);

  return (
    <Flex column style={{ paddingBottom: '50px' }}>
      <PageTitle
        title="Select engineering diagrams"
        subtitle="Select engineering diagrams you want to make interactive"
      />
      <SelectionBar
        type="diagrams"
        filter={filter}
        updateFilter={updateFilter}
        showSelected={showSelected}
        setShowSelected={setShowSelected}
      />
      <SelectionTable
        type="files"
        filter={filter}
        isSelectAll={isSelectAll}
        selectedRowKeys={selectedRowKeys}
        setSelectAll={setSelectAll}
        setSelectedRowKeys={setSelectedRowKeys}
        diagramsToContextualizeIds={diagramsToContextualizeIds}
        showSelected={showSelected}
      />
    </Flex>
  );
}
