import { useEffect, useMemo, useState } from 'react';
import uuid from 'uuid';
import PapaParse from 'papaparse';
import { notification } from 'antd';

import { useSDK } from '@cognite/sdk-provider';
import { trackEvent } from '@cognite/cdf-route-tracker';

import { useActiveTableContext } from 'contexts';
import { sleep } from 'utils/utils';

export const useCSVUpload = (
  file: File | undefined,
  selectedKeyIndex: number
) => {
  const { database, table } = useActiveTableContext();
  const sdk = useSDK();

  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [isUploadFailed, setIsUploadFailed] = useState(false);
  const [isUploadCompleted, setIsUploadCompleted] = useState(false);

  const [columns, setColumns] = useState<string[] | undefined>();
  const [parser, setParser] = useState<PapaParse.Parser | undefined>();
  const [parsedCursor, setParsedCursor] = useState(0);
  const [uploadedCursor, setUploadedCursor] = useState(0);

  const [parsePercentage] = useMemo(() => {
    if (!file || !isUpload) return [0];
    const newParsePercentage = Math.ceil((parsedCursor / file.size) * 100);
    return [newParsePercentage];
  }, [parsedCursor, file, isUpload]);

  const [uploadPercentage, uploadSize] = useMemo(() => {
    if (!file || !isUpload) return [0, 0];
    const newUploadPercentage = Math.ceil((uploadedCursor / file.size) * 100);
    const size = Math.ceil(uploadedCursor / 2 ** 20);
    return [newUploadPercentage, size];
  }, [uploadedCursor, file, isUpload]);

  useEffect(
    () => () => {
      if (!parser) return;
      parser.abort();
    },
    [parser]
  );

  useEffect(() => {
    if (!file) return;
    PapaParse.parse(file, {
      step(result, _parser) {
        setColumns(result.data as string[]);
        _parser.abort();
      },
      complete: () => {},
    });
  }, [file]);

  useEffect(() => {
    if (!file || !isUpload) return;
    PapaParse.parse<any>(file, {
      dynamicTyping: true,
      skipEmptyLines: true,
      beforeFirstChunk: (chunk) => chunk.split('\n').splice(1).join('\n'),
      error: () => {
        notification.error({
          message: `${file.name} could not be parsed!`,
          key: 'file-upload',
        });
        setIsUpload(false);
        setIsUploadFailed(true);
      },
      complete: () => {
        setIsUploadCompleted(true);
        setIsUpload(false);
      },
      chunk(results, _parser) {
        setParser(_parser);
        _parser.pause();
        setParsedCursor(results.meta.cursor);
        const items = new Array(results.data.length);
        results.data.forEach((row: string[], rowIndex) => {
          const newColumns: any = {};
          columns?.forEach((column, index) => {
            newColumns[column] = row[index];
          });
          items[rowIndex] = {
            key:
              selectedKeyIndex === -1
                ? uuid()
                : row[selectedKeyIndex].toString(),
            columns: newColumns,
          };
        });

        sdk.raw
          .insertRows(database, table, items)
          .then(() => {
            setUploadedCursor(results.meta.cursor);
          })
          // Keep the main thread "open" to render progress before continuing parsing the file
          .then(() => sleep(250))
          .then(() => _parser.resume())
          .catch(() => {
            setIsUploadFailed(true);
          });
      },
    });
  }, [file, isUpload, columns, selectedKeyIndex, database, table, sdk.raw]);

  useEffect(() => {
    if (!file || !isUploadCompleted) return;
    if (isUploadFailed)
      notification.error({
        message: `${file.name} is not uploaded!`,
        key: 'file-upload',
      });
    else
      notification.success({
        message: `${file.name} is uploaded!`,
        key: 'file-upload',
      });
  }, [file, isUploadCompleted, isUploadFailed]);

  const onConfirmUpload = () => {
    trackEvent('RAW.Explorer.CSVUpload.Upload');
    setIsUpload(true);
  };

  return {
    parsePercentage,
    uploadPercentage,
    uploadSize,
    columns,
    isUpload,
    isUploadFailed,
    isUploadCompleted,
    isParsing: !!parser,
    onConfirmUpload,
  };
};
