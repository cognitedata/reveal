import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Table } from '@interactive-diagrams-app/components/Common';
import {
  ProgressType,
  ReviewStatus,
  approvalDetails,
} from '@interactive-diagrams-app/components/Filters';
import {
  useActiveWorkflow,
  useParsingJob,
  isFileApproved,
  isFilePending,
} from '@interactive-diagrams-app/hooks';
import {
  selectInteractiveDiagrams,
  useWorkflowDiagramsIds,
} from '@interactive-diagrams-app/modules/workflows';
import { Checkbox } from 'antd';

import { FileInfo } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { getSvgConvertJobs, getSelectedDiagramsIds } from '../selectors';

import { getColumns, AdjustedFileInfo } from './columns';
import { SelectionFilter } from './types';

type ResultsTableProps = {
  selectionFilter: SelectionFilter;
  showLoadingSkeleton: boolean;
};

export default function ResultsTable(props: ResultsTableProps): JSX.Element {
  const { selectionFilter, showLoadingSkeleton } = props;
  const dispatch = useDispatch();

  const [columns, setColumns] = useState();

  const { workflowId } = useActiveWorkflow();
  const diagramIds = useWorkflowDiagramsIds(workflowId, true);
  const { failedFiles } = useParsingJob();
  const { data: diagrams = [] } = useCdfItems<FileInfo>(
    'files',
    diagramIds.map((id) => ({ id })),
    true
  );

  const selectedDiagramsIds = useSelector(getSelectedDiagramsIds);
  const svgConvert = useSelector(getSvgConvertJobs);

  const didFileFail = (fileId: number): ProgressType => {
    const didFail = failedFiles?.find(
      (failedFile) => failedFile.fileId === fileId
    );
    return didFail ? 'failed' : 'completed';
  };

  const getDiagramStatus = (file: FileInfo): ReviewStatus => {
    if (isFileApproved(file)) return approvalDetails.approved;
    if (isFilePending(file)) return approvalDetails.pending;
    return approvalDetails.unknown;
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
      uploadJob: svgConvert[d.id],
      progress: didFileFail(d.id),
      status: getDiagramStatus(d).type,
      svg: false,
      links: 0,
    }))
    .filter(filterDiagrams);

  const onRowChange = (keys: any) => {
    const selectedIds = [...keys];
    dispatch(
      selectInteractiveDiagrams({
        workflowId,
        diagramIds: selectedIds,
      })
    );
  };
  const onSelectAll = () => {
    const selectedIds =
      adjustedDiagrams.length === selectedDiagramsIds.length
        ? []
        : adjustedDiagrams.map((d) => d.id);
    dispatch(
      selectInteractiveDiagrams({
        workflowId,
        diagramIds: selectedIds,
      })
    );
  };

  useEffect(() => {
    const newColumns = getColumns(workflowId, showLoadingSkeleton);
    setColumns(newColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoadingSkeleton]);

  useEffect(() => {
    dispatch(
      selectInteractiveDiagrams({ workflowId, diagramIds: selectedDiagramsIds })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDiagramsIds]);

  useEffect(() => {
    dispatch(selectInteractiveDiagrams({ workflowId, diagramIds: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionFilter]);

  const headerCheckbox = (
    <Checkbox
      onChange={onSelectAll}
      checked={Boolean(selectedDiagramsIds.length)}
      indeterminate={
        selectedDiagramsIds.length > 0 &&
        selectedDiagramsIds.length < diagrams.length
      }
    />
  );

  return (
    <Table
      columns={columns}
      dataSource={adjustedDiagrams}
      rowSelection={{
        onSelectAll,
        onChange: onRowChange,
        columnTitle: headerCheckbox,
        selectedRowKeys: selectedDiagramsIds,
        getCheckboxProps: (record: any) => ({
          disabled: record.progress === 'failed',
        }),
      }}
      options={{
        narrow: true,
      }}
    />
  );
}
