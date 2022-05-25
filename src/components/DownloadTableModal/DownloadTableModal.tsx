import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CSVLink } from 'react-csv';
import { escapeCSVValue } from 'utils/utils';
import Modal, { ModalProps } from 'components/Modal/Modal';
import Message from 'components/Message/Message';
import { useDownloadData } from 'hooks/table-data';
import { RAW_PAGE_SIZE_LIMIT } from 'utils/constants';

const COLUMNS_IGNORED = ['column-index', 'lastUpdatedTime'];

type DownloadTableModalProps = {
  databaseName: string;
  tableName: string;
} & Omit<ModalProps, 'children' | 'title' | 'footer'>;

const DownloadTableModal = ({
  databaseName,
  tableName,
  onCancel,
  visible,
  ...modalProps
}: DownloadTableModalProps): JSX.Element => {
  const [rowCount, setRowCount] = useState<string>('100');
  const [fetchRowCount, setFetchRowCount] = useState<string>(rowCount);
  const { currentRows, fetchedRows, isDownloading, isError } = useDownloadData(
    Number(fetchRowCount)
  );

  useEffect(() => {
    setRowCount(currentRows.length.toString());
  }, [currentRows.length]);

  const handleClose = (): void => {
    setRowCount(currentRows.length.toString());
    onCancel();
  };

  const onDownloadData = useMemo(() => {
    return (
      fetchedRows.slice(0, Number(fetchRowCount)).map((item) => {
        const escapedColumns: Record<string, string> = {};
        Object.keys(item).forEach((key) => {
          escapedColumns[key] = escapeCSVValue(item[key]);
        });
        COLUMNS_IGNORED.forEach((column: string) => {
          delete escapedColumns[column];
        });
        return { key: item.key, ...escapedColumns };
      }) || []
    );
  }, [fetchRowCount, fetchedRows]);

  const isItValidRowNumber = (n: string | number): boolean => {
    const count = Number(n);
    return Number.isInteger(count) && count > 0 && count <= RAW_PAGE_SIZE_LIMIT;
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={handleClose} type="ghost">
          Cancel
        </StyledCancelButton>,
        rowCount !== fetchRowCount ? (
          <Button
            disabled={!isItValidRowNumber(rowCount)}
            onClick={() => setFetchRowCount(rowCount)}
            type="primary"
          >
            Create File
          </Button>
        ) : (
          <CSVLink
            filename={`cognite-${databaseName}-${tableName}.csv`}
            data={onDownloadData}
          >
            <Button
              disabled={isError}
              loading={isDownloading}
              onClick={handleClose}
              type="primary"
            >
              Download
            </Button>
          </CSVLink>
        ),
      ]}
      onCancel={handleClose}
      title={`Download as csv ${tableName}`}
      visible={visible}
      {...modalProps}
    >
      <Message
        message={`The download option is limited to ${RAW_PAGE_SIZE_LIMIT} rows.`}
        type="info"
      />
      <StyledRowsInputWrapper>
        Rows to download
        <Input
          disabled={isDownloading}
          onChange={(event) => setRowCount(event.target.value)}
          value={rowCount}
        />
      </StyledRowsInputWrapper>
    </Modal>
  );
};

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const StyledRowsInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  font-weight: 500;
`;

export default DownloadTableModal;
