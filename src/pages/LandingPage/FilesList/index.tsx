import React from 'react';
import { createLink } from '@cognite/cdf-utilities';
import { FileInfo } from '@cognite/sdk';
import { Checkbox } from 'antd';
import { FileWithAnnotations } from 'hooks';
import { stringContains } from 'modules/contextualization/utils';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { Table } from 'components/Common';
import { getColumns } from './columns';

const PAGE_SIZE = 10;

type Props = {
  query: string;
  files?: FileWithAnnotations[];
  selectedDiagramsIds: number[];
  setSelectedDiagramsIds: React.Dispatch<React.SetStateAction<number[]>>;
};

export default function FilesList(props: Props) {
  const { query, files, selectedDiagramsIds, setSelectedDiagramsIds } = props;

  const onFileView = (file: FileInfo): void => {
    const fileId = file.id ?? file.externalId;
    trackUsage(PNID_METRICS.landingPage.viewFile, {
      fileId,
    });
    window.open(createLink(`/explore/file/${fileId}`), '_blank');
  };

  const interactiveColumns = getColumns(onFileView);

  const handleSearchFiles = () => {
    if (query.trim()?.length) {
      trackUsage(PNID_METRICS.landingPage.useSearch);
      return (files ?? []).filter((file) =>
        stringContains(file.name, query)
      ) as FileInfo[];
    }
    return files as FileInfo[];
  };

  const diagrams = handleSearchFiles();

  const onSelectAll = () => {
    setSelectedDiagramsIds((ids: number[]) =>
      ids.length === diagrams.length ? [] : diagrams.map((d) => d.id)
    );
  };
  const onDiagramsSelect = (keys: any) => {
    const diagramIds = [...keys];
    setSelectedDiagramsIds(diagramIds);
  };

  const headerCheckbox = (
    <Checkbox
      checked={Boolean(selectedDiagramsIds.length)}
      indeterminate={
        selectedDiagramsIds.length > 0 &&
        selectedDiagramsIds.length < diagrams.length
      }
      onChange={onSelectAll}
    />
  );

  return (
    <Table
      rowKey="id"
      // @ts-ignore
      columns={interactiveColumns}
      dataSource={diagrams}
      size="middle"
      pagination={{
        pageSize: PAGE_SIZE,
        hideOnSinglePage: true,
      }}
      rowSelection={{
        onSelectAll,
        onChange: onDiagramsSelect,
        selectedRowKeys: selectedDiagramsIds,
        columnTitle: headerCheckbox,
        getCheckboxProps: (record: any) => ({
          disabled: record.progress === 'failed',
        }),
      }}
      locale={{
        emptyText: 'No pending engineering diagrams were found.',
      }}
      options={{ narrow: true }}
    />
  );
}
