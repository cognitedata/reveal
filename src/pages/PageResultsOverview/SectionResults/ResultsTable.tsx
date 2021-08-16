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
import { getContextualizationJobs } from '../selectors';
import { getColumns, AdjustedFileInfo } from './columns';
import { SelectionFilter } from './types';

type ResultsTableProps = {
  selectionFilter: SelectionFilter;
};

export default function ResultsTable(props: ResultsTableProps): JSX.Element {
  const history = useHistory();
  const dispatch = useDispatch();
  const { selectionFilter } = props;
  const [selectedKeys, setSelectedKeys] = useState([] as number[]);

  const [columns, setColumns] = useState();

  const { workflowId } = useActiveWorkflow();
  const diagramIds = useWorkflowDiagramsIds(workflowId, true);
  const { data: diagrams } = useCdfItems<FileInfo>(
    'files',
    diagramIds.map((id) => ({ id })),
    true
  );

  const { uploadJobs } = useSelector(getContextualizationJobs);
  const { search } = history.location;
  const { page = 1 } = queryString.parse(search, { parseNumbers: true });

  const { failedFiles } = useParsingJob(workflowId);

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
    ?.filter((d: FileInfo) => Boolean(d))
    .map((d: FileInfo) => ({
      ...d,
      uploadJob: uploadJobs[d.id],
      status: didFileFail(d.id),
      svg: false,
      links: 0,
    }))
    .filter(filterDiagrams);

  const onRowChange = (keys: any) => setSelectedKeys(keys as number[]);

  const onPaginationChange = (newPage: number) => {
    history.push({
      search: queryString.stringify({
        ...queryString.parse(search),
        page: newPage,
      }),
    });
  };
  const onSelectAll = (selectAll: boolean) =>
    setSelectedKeys(
      selectAll && adjustedDiagrams
        ? adjustedDiagrams.map((el: any) => el.id)
        : ([] as number[])
    );

  useEffect(() => {
    const newColumns = getColumns(workflowId);
    setColumns(newColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(selectDiagrams({ workflowId, diagramIds: selectedKeys }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);

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
        selectedRowKeys: selectedKeys,
      }}
      pagination={{
        onChange: onPaginationChange,
        current: Number(page),
      }}
      options={{
        narrow: true,
      }}
    />
  );
}
