import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';

import { Button, Input, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CSVLink } from 'react-csv';
import { escapeCSVValue } from 'utils/utils';
import Modal, { ModalProps } from 'components/Modal/Modal';
import Message from 'components/Message/Message';
import { useDownloadData } from 'hooks/table-data';

const COLUMNS_IGNORED = ['column-index', 'lastUpdatedTime'];
const MAX_ROWS = 10_000;

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
  const { currentRows, fetchedRows, isFetching } = useDownloadData(
    Number(fetchRowCount)
  );

  useEffect(() => {
    setRowCount(currentRows.length.toString());
  }, [currentRows.length]);

  const handleClose = (): void => {
    setRowCount(currentRows.length.toString());
    onCancel();
  };

  const updateFetchedData = useMemo(
    () => debounce(() => visible && setFetchRowCount(rowCount), 500),
    [rowCount, visible]
  );

  useEffect(() => {
    updateFetchedData();
  }, [updateFetchedData, rowCount]);

  useEffect(() => () => updateFetchedData.cancel(), [updateFetchedData]);

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
    return Number.isInteger(count) && count > 0 && count <= MAX_ROWS;
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={handleClose} type="ghost">
          Cancel
        </StyledCancelButton>,
        <CSVLink
          filename={`cognite-${databaseName}-${tableName}.csv`}
          data={onDownloadData}
        >
          <Button
            disabled={!isItValidRowNumber(rowCount)}
            loading={isFetching || rowCount !== fetchRowCount}
            onClick={handleClose}
            type="primary"
          >
            Download
          </Button>
        </CSVLink>,
      ]}
      onCancel={handleClose}
      title={
        <StyledDownloadTableModalTitle level={5}>
          Download as csv {tableName}
        </StyledDownloadTableModalTitle>
      }
      visible={visible}
      {...modalProps}
    >
      <Message
        message={`The download option is limited to ${MAX_ROWS} rows.`}
        type="info"
      />
      <StyledRowsInputWrapper>
        Rows to download
        <Input
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

const StyledDownloadTableModalTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 312px;
`;

const StyledRowsInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  font-weight: 500;
`;

export default DownloadTableModal;
