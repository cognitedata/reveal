import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FileInfo } from '@cognite/sdk';
import queryString from 'query-string';
import { Table } from 'components/Common';
import { StatusType } from 'components/Filters';
import {
  useParsingJob,
  selectDiagrams,
} from 'modules/contextualization/pnidParsing';
import { useWorkflowDiagramsIds } from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { getContextualizationJobs, getSelectedDiagramsIds } from '../selectors';
import { getColumns, AdjustedFileInfo } from './columns';
import { SelectionFilter } from './types';

type ResultsTableProps = {
  selectionFilter: SelectionFilter;
  showLoadingSkeleton: boolean;
};

export default function ResultsTable(props: ResultsTableProps): JSX.Element {
  const { selectionFilter, showLoadingSkeleton } = props;
  const history = useHistory();
  const dispatch = useDispatch();

  const [columns, setColumns] = useState();

  const { workflowId } = useActiveWorkflow();
  const diagramIds = useWorkflowDiagramsIds(workflowId, true);
  const { failedFiles } = useParsingJob(workflowId);
  const { data: diagrams = [] } = useCdfItems<FileInfo>(
    'files',
    diagramIds.map((id) => ({ id })),
    true
  );

  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);
  const { uploadJobs } = useSelector(getContextualizationJobs);
  const { search } = history.location;
  const { page = 1 } = queryString.parse(search, { parseNumbers: true });

  const didFileFail = (fileId: number): StatusType => {
    const didFail = failedFiles?.find(
      (failedFile) => failedFile.fileId === fileId
    );
    return didFail ? 'failed' : 'completed';
  };

  const filterDiagrams = (diagram: AdjustedFileInfo): boolean => {
    const isFilteredByName = diagram.name
      .toLowerCase()
      .includes(selectionFilter.nameQuery ?? '');
    const isFilteredByDataSet =
      selectionFilter.dataSetIds?.length && diagram.dataSetId
        ? selectionFilter.dataSetIds.includes(diagram.dataSetId)
        : true;
    const isFilteredByStatus =
      selectionFilter.status?.length && diagram.status
        ? selectionFilter.status.includes(diagram.status)
        : true;
    const isFilteredByMimeType =
      selectionFilter.fileTypes?.length && diagram.mimeType
        ? selectionFilter.fileTypes.includes(diagram.mimeType)
        : true;
    const isFilteredByLabels = selectionFilter.labels?.length
      ? selectionFilter.labels.some((label) =>
          diagram.labels?.find(
            (diagramLabel) => diagramLabel.externalId === label
          )
        )
      : true;

    return (
      isFilteredByName &&
      isFilteredByDataSet &&
      isFilteredByLabels &&
      isFilteredByStatus &&
      isFilteredByMimeType
    );
  };

  const adjustedDiagrams = diagrams
    .filter((d: FileInfo) => Boolean(d))
    .map((d: FileInfo) => ({
      ...d,
      uploadJob: uploadJobs[d.id],
      status: didFileFail(d.id),
      svg: false,
      links: 0,
    }))
    .filter(filterDiagrams);

  const onRowChange = (keys: any) => {
    const selectedIds = [...keys];
    dispatch(
      selectDiagrams({
        workflowId,
        diagramIds: selectedIds,
      })
    );
  };
  const onSelectAll = (selectAll?: boolean) => {
    const selectedIds =
      selectAll && adjustedDiagrams
        ? adjustedDiagrams.map((el: any) => el.id)
        : ([] as number[]);
    dispatch(
      selectDiagrams({
        workflowId,
        diagramIds: selectedIds,
      })
    );
  };

  const onPaginationChange = (newPage: number) => {
    history.push({
      search: queryString.stringify({
        ...queryString.parse(search),
        page: newPage,
      }),
    });
  };

  useEffect(() => {
    const newColumns = getColumns(workflowId, showLoadingSkeleton);
    setColumns(newColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoadingSkeleton]);

  useEffect(() => {
    dispatch(selectDiagrams({ workflowId, diagramIds: selectedDiagramsIds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDiagramsIds]);

  useEffect(() => {
    dispatch(selectDiagrams({ workflowId, diagramIds: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionFilter]);

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={adjustedDiagrams}
      rowSelection={{
        onSelectAll,
        onChange: onRowChange,
        selectedRowKeys: selectedDiagramsIds,
        getCheckboxProps: (record: any) => ({
          disabled: record.status === 'failed',
        }),
      }}
      pagination={{
        onChange: onPaginationChange,
        current: Number(page),
        position: ['bottomLeft'],
        size: 'small',
        showQuickJumper: true,
        showSizeChanger: true,
      }}
      options={{
        narrow: true,
      }}
    />
  );
}
