import { useEffect, useMemo, useState } from 'react';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { useSDK } from '@cognite/sdk-provider';
import { notification } from 'antd';
import { chunk, isArray } from 'lodash';
import uuid from 'uuid';

import { useTranslation } from 'common/i18n';
import { PrimaryKeyMethod } from 'components/CreateTableModal/CreateTableModal';
import { sleep } from 'utils/utils';

import { UseUploadOptions } from './upload';

const ROW_CHUNK_SIZE = 10000;
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
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [isUploadFailed, setIsUploadFailed] = useState(false);
  const [isUploadCompleted, setIsUploadCompleted] = useState(false);

  const [columns, setColumns] = useState<string[] | undefined>();
  const [jsonContent, setJsonContent] = useState<
    Record<string, any>[] | undefined
  >(undefined);

  const [requestChunks, setRequestChunks] = useState<Record<string, any>[][]>();
  const [fetchingIndex, setFetchingIndex] = useState(-1);
  const [fetchedIndex, setFetchedIndex] = useState(-1);

  const [uploadedRowCount, setUploadedRowCount] = useState(0);
  const [totalRowCount, setTotalRowCount] = useState(0);

  const parsePercentage = useMemo(() => {
    if (!file || !isUpload) return 0;
    return columns ? 100 : 0;
  }, [columns, file, isUpload]);

  const uploadPercentage = useMemo(() => {
    if (!file || !isUpload) return 0;
    return Math.ceil((uploadedRowCount / totalRowCount) * 100);
  }, [file, isUpload, totalRowCount, uploadedRowCount]);

  const selectedColumn =
    selectedPrimaryKeyMethod === PrimaryKeyMethod.ChooseColumn &&
    selectedColumnIndex !== undefined
      ? columns?.[selectedColumnIndex]
      : undefined;

  useEffect(() => {
    if (!file || jsonContent) return;

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      let content: string | undefined = undefined;
      try {
        content = JSON.parse((e.target?.result as string | undefined) ?? '');
      } catch {
        setIsUploadFailed(true);
      }

      if (isArray(content)) {
        setJsonContent(content);
        setColumns(Object.keys(content[0]));
        setTotalRowCount(content.length);
      } else {
        setIsUploadFailed(true);
      }
    };
  }, [file, jsonContent]);

  useEffect(() => {
    if (
      !file ||
      !isUpload ||
      !database ||
      !table ||
      !requestChunks ||
      fetchingIndex === fetchedIndex ||
      fetchingIndex >= requestChunks.length
    ) {
      return;
    }

    const chunk = requestChunks.slice(fetchedIndex + 1, fetchingIndex + 1);

    let isFailed = false;
    Promise.all(
      chunk.map(async (row) => {
        let items: { key: string; columns: Record<string, any> }[] = [];
        try {
          items = row.map((rowData: Record<string, any>) => ({
            key: !selectedColumn ? uuid() : rowData[selectedColumn].toString(),
            columns: rowData,
          }));
        } catch (e) {
          isFailed = true;
        }

        return sdk.raw
          .insertRows(database, table, items)
          .then(() => {
            setUploadedRowCount((prevCount) => prevCount + row.length);
          })
          .then(() => sleep(250))
          .catch(() => {
            isFailed = true;
          });
      })
    ).then(() => {
      setFetchedIndex(fetchingIndex);

      if (isFailed) {
        setIsUploadFailed(true);
      } else {
        setFetchingIndex((prevIndex) =>
          Math.min(prevIndex + REQUEST_CHUNK_SIZE, requestChunks.length - 1)
        );
      }
    });
  }, [
    file,
    isUpload,
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
      setIsUploadCompleted(true);
      setIsUpload(false);
    }
  }, [requestChunks, fetchedIndex]);

  useEffect(() => {
    if (!file || !isUploadCompleted) return;
    if (isUploadFailed)
      notification.error({
        message: t('file-upload-error', { name: file.name }),
        key: 'file-upload',
      });
    else
      notification.success({
        message: t('file-upload-success', { name: file.name }),
        key: 'file-upload',
      });
  }, [file, isUploadCompleted, isUploadFailed, t]);

  const onConfirmUpload = async (database: string, table: string) => {
    trackEvent('RAW.Explorer.JSONUpload.Upload');
    setTableToUpload([database, table]);
    setIsUpload(true);

    const requestChunks = chunk(jsonContent, ROW_CHUNK_SIZE);

    setRequestChunks(requestChunks);
    setFetchingIndex(REQUEST_CHUNK_SIZE - 1);
  };

  return {
    parsePercentage,
    uploadPercentage,
    columns,
    isUpload,
    isUploadFailed,
    isUploadCompleted,
    isParsing: !!totalRowCount,
    onConfirmUpload,
  };
};
