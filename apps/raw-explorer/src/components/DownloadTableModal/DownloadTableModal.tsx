import { useEffect, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import Message from '@raw-explorer/components/Message/Message';
import Modal, { ModalProps } from '@raw-explorer/components/Modal/Modal';
import { useDownloadData } from '@raw-explorer/hooks/table-data';
import { RAW_PAGE_SIZE_LIMIT } from '@raw-explorer/utils/constants';
import { escapeCSVValue } from '@raw-explorer/utils/utils';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Button, Input } from '@cognite/cogs.js';
import { RawDBRow } from '@cognite/sdk';

type DownloadTableModalProps = {
  databaseName: string;
  tableName: string;
} & Omit<ModalProps, 'children' | 'title' | 'footer'>;

export const prepareRows = (
  rows: RawDBRow[],
  expectedCount: number
): Record<string, string>[] => {
  return (
    rows.slice(0, Number(expectedCount)).map((item) => {
      const escapedColumns: Record<string, string> = { key: '' };
      Object.keys(item.columns).forEach((columnName) => {
        escapedColumns[columnName] = escapeCSVValue(
          typeof item.columns[columnName] === 'object'
            ? JSON.stringify(item.columns[columnName])
            : item.columns[columnName]
        );
      });
      escapedColumns.key = escapeCSVValue(item.key);
      return escapedColumns;
    }) || []
  );
};

const DownloadTableModal = ({
  databaseName,
  tableName,
  onCancel,
  visible,
  ...modalProps
}: DownloadTableModalProps): JSX.Element => {
  const { t } = useTranslation();
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
    return prepareRows(fetchedRows, Number(fetchRowCount));
  }, [fetchRowCount, fetchedRows]);

  const isItValidRowNumber = (n: string | number): boolean => {
    const count = Number(n);
    return Number.isInteger(count) && count > 0 && count <= RAW_PAGE_SIZE_LIMIT;
  };

  return (
    <Modal
      footer={[
        <StyledCancelButton onClick={handleClose} type="ghost">
          {t('cancel')}
        </StyledCancelButton>,
        rowCount !== fetchRowCount ? (
          <Button
            disabled={!isItValidRowNumber(rowCount)}
            onClick={() => {
              trackEvent('RAW.Explorer.PrepareFile');
              setFetchRowCount(rowCount);
            }}
            type="primary"
          >
            {t('download-table-modal-button-create-file')}
          </Button>
        ) : (
          <CSVLink
            onClick={() => trackEvent('RAW.Explorer.DownloadCSV')}
            filename={`cognite-${databaseName}-${tableName}.csv`}
            data={onDownloadData}
          >
            <Button
              disabled={isError || isDownloading}
              loading={isDownloading}
              onClick={handleClose}
              type="primary"
            >
              {t('download-table-modal-button-download')}
            </Button>
          </CSVLink>
        ),
      ]}
      onCancel={handleClose}
      title={t('download-table-modal-title', { name: tableName })}
      visible={visible}
      {...modalProps}
    >
      <Message
        message={t('download-table-modal-rows-limit-message', {
          count: RAW_PAGE_SIZE_LIMIT,
        })}
        type="info"
      />
      <StyledRowsInputWrapper>
        {t('download-table-modal-rows-limit-label')}
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
