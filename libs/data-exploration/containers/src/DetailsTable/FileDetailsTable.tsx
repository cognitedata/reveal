import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { FileInfo } from '@cognite/sdk';

import { getHiddenColumns, useTranslation } from '@data-exploration-lib/core';
import {
  InternalDocument,
  useDocumentsMetadataKeys,
} from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const FileDetailsTable = (
  props: Omit<TableProps<InternalDocument | FileInfo>, 'columns'>
) => {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { data: metadataKeys } = useDocumentsMetadataKeys();

  const metadataColumns = useMemo(() => {
    return (metadataKeys || []).map((key: string) =>
      tableColumns.metadata(key)
    );
  }, [metadataKeys]);

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.mimeType,
        tableColumns.externalId(),
        tableColumns.id(),
        tableColumns.uploadedTime,
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.dataSet,
        tableColumns.source(),
        tableColumns.labels,
        ...metadataColumns,
      ] as ColumnDef<FileInfo | InternalDocument>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, ['name', 'content']);

  return (
    <Wrapper>
      <Table
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={4}
        showLoadButton
        enableSelection
        {...props}
      />
    </Wrapper>
  );
};
