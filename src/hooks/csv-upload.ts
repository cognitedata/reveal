import { useEffect, useState } from 'react';
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

  const [upload, setUpload] = useState<boolean>(false);
  const [complete, setComplete] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [columnHeaders, setColumnHeaders] = useState<string[] | undefined>();
  const [parser, setParser] = useState<PapaParse.Parser | undefined>();
  const [parsedCursor, setParsedCursor] = useState(0);
  const [uploadedCursor, setUploadedCursor] = useState(0);

  const [parsePercentage, setParsePercentage] = useState(0);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploadSize, setUploadSize] = useState(0);

  useEffect(() => {
    if (!file || !upload) return;
    const percentage = Math.floor((parsedCursor / file.size) * 100);
    setParsePercentage(percentage);
  }, [parsedCursor, file, upload]);

  useEffect(() => {
    if (!file || !upload) return;
    const percentage = Math.floor((uploadedCursor / file.size) * 100);
    const size = Math.floor(uploadedCursor / 2 ** 20);
    setUploadPercentage(percentage);
    setUploadSize(size);
  }, [uploadedCursor, file, upload]);

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
        setColumnHeaders(result.data as string[]);
        _parser.abort();
      },
      complete: () => {},
    });
  }, [file]);

  useEffect(() => {
    if (!file || !complete) return;
    networkError
      ? notification.error({
          message: `${file.name} is not uploaded!`,
          key: 'file-upload',
        })
      : notification.success({
          message: `${file.name} is uploaded!`,
          key: 'file-upload',
        });
  }, [file, complete, networkError]);

  useEffect(() => {
    if (!file || !upload) return;
    PapaParse.parse<any>(file, {
      dynamicTyping: true,
      skipEmptyLines: true,
      chunk(results, _parser) {
        setParser(_parser);
        _parser.pause();
        setParsedCursor(results.meta.cursor);
        const items = new Array(results.data.length);
        results.data.forEach((row: string[], rowIndex) => {
          const columnHeadersNew: any = {};
          columnHeaders?.forEach((column, index) => {
            columnHeadersNew[column] = row[index];
          });
          items[rowIndex] = {
            key:
              selectedKeyIndex === -1
                ? uuid()
                : row[selectedKeyIndex].toString(),
            columnHeaders: columnHeadersNew,
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
            setNetworkError(true);
          });
      },
      beforeFirstChunk(chunk) {
        return chunk.split('\n').splice(1).join('\n');
      },

      error() {
        notification.error({
          message: `${file.name} could not be parsed!`,
          key: 'file-upload',
        });
      },
      complete() {
        setComplete(true);
      },
    });
  }, [file, upload, columnHeaders, database, table]);

  const onConfirmUpload = () => {
    trackEvent('RAW.Explorer.CSVUpload.Upload');
    setUpload(true);
  };

  return {
    parsePercentage,
    uploadPercentage,
    uploadSize,
    columnHeaders,
    isUpload: upload,
    isUploadFinished: complete,
    isParsing: parser,
    onConfirmUpload,
  };
};
