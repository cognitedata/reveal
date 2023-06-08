import { useEffect, useState } from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import { PrimaryKeyMethod } from '@raw-explorer/components/CreateTableModal/CreateTableModal';
import { notification } from 'antd';
import { chunk, isArray } from 'lodash';
import { v4 as uuid } from 'uuid';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { useSDK } from '@cognite/sdk-provider';

import { RAWUploadStatus, renderUploadError, UseUploadOptions } from './upload';

const ROW_CHUNK_SIZE = 1000;
const REQUEST_CHUNK_SIZE = 3;

export const useJSONUpload = ({
  file,
  selectedPrimaryKeyMethod,
  selectedColumnIndex,
}: UseUploadOptions) => {
  const { t } = useTranslation();
  const sdk = useSDK();

  const [[database, table], setTableToUpload] = useState<
    [string | undefined, string | undefined]
  >([undefined, undefined]);

  const [columns, setColumns] = useState<string[] | undefined>();
  const [jsonContent, setJsonContent] = useState<
    Record<string, any>[] | undefined
  >(undefined);

  const [requestChunks, setRequestChunks] = useState<Record<string, any>[][]>();
  const [fetchingIndex, setFetchingIndex] = useState(-1);
  const [fetchedIndex, setFetchedIndex] = useState(-1);

  const [uploadedRowCount, setUploadedRowCount] = useState(0);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const [uploadStatus, setUploadStatus] = useState<RAWUploadStatus>(undefined);

  const uploadPercentage =
    !uploadStatus || uploadStatus === 'ready'
      ? 0
      : Math.ceil((uploadedRowCount / totalRowCount) * 100);
  const parsePercentage = uploadPercentage; // FIXME: is it correct?

  const selectedColumn =
    selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
    selectedColumnIndex !== undefined
      ? columns?.[selectedColumnIndex]
      : undefined;

  useEffect(() => {
    if (!file || jsonContent) {
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (e) => {
      let content: string | undefined = undefined;
      try {
        content = JSON.parse((e.target?.result as string | undefined) ?? '');
        if (isArray(content)) {
          setJsonContent(content);
          setColumns(Object.keys(content[0]));
          setTotalRowCount(content.length);
          setUploadStatus('ready');
        } else {
          throw new Error(t('file-parse-content-format-error'));
        }
      } catch (error: any) {
        const errorMessage = error?.message;
        notification.error({
          message: t('file-invalid-error', { name: file.name }),
          description: errorMessage,
          key: 'file-invalid',
        });
      }
    };
  }, [file, jsonContent, t]);

  useEffect(() => {
    if (
      !file ||
      !database ||
      !table ||
      !requestChunks ||
      fetchingIndex === fetchedIndex ||
      fetchingIndex >= requestChunks.length
    ) {
      return;
    }

    const chunk = requestChunks.slice(fetchedIndex + 1, fetchingIndex + 1);

    Promise.all(
      chunk.map(async (row) => {
        let items: { key: string; columns: Record<string, any> }[] = [];
        try {
          items = row.map((rowData: Record<string, any>) => ({
            key: !selectedColumn ? uuid() : rowData[selectedColumn].toString(),
            columns: rowData,
          }));
        } catch {
          return Promise.reject(t('file-upload-primary-key-empty-cells'));
        }

        return sdk.raw.insertRows(database, table, items).then(() => {
          setUploadedRowCount((prevCount) => prevCount + row.length);
        });
      })
    )
      .then(() => {
        setFetchedIndex(fetchingIndex);
        setFetchingIndex((prevIndex) =>
          Math.min(prevIndex + REQUEST_CHUNK_SIZE, requestChunks.length - 1)
        );
      })
      .catch((e) => {
        notification.error({
          message: t('file-upload-error', { name: file.name }),
          description: renderUploadError(e),
          key: 'file-upload',
        });
        setUploadStatus('error');
      });
  }, [
    file,
    columns,
    selectedColumn,
    database,
    table,
    sdk.raw,
    t,
    fetchedIndex,
    fetchingIndex,
    requestChunks,
  ]);

  useEffect(() => {
    if (requestChunks && fetchedIndex >= requestChunks.length - 1) {
      setUploadStatus('success');
      notification.success({
        message: t('file-upload-success', { name: file?.name }),
        key: 'file-upload',
      });
    }
  }, [file, requestChunks, fetchedIndex, t]);

  const onConfirmUpload = async (database: string, table: string) => {
    trackEvent('RAW.Explorer.JSONUpload.Upload');
    setTableToUpload([database, table]);
    setUploadStatus('in-progress');

    const requestChunks = chunk(jsonContent, ROW_CHUNK_SIZE);

    setRequestChunks(requestChunks);
    setFetchingIndex(
      Math.min(REQUEST_CHUNK_SIZE - 1, requestChunks.length - 1)
    );
  };

  return {
    parsePercentage,
    uploadPercentage,
    columns,
    onConfirmUpload,

    isUploadError: uploadStatus === 'error',
    isUploadInProgress: uploadStatus === 'in-progress',
    isUploadSuccess: uploadStatus === 'success',
    uploadStatus,
  };
};
