import React, { useEffect, useState } from 'react';

import uuid from 'uuid';
import PapaParse from 'papaparse';

import {
  notification,
  Progress,
  Tag,
  Select,
  Alert,
  Modal,
  Upload,
} from 'antd';

import { UploadChangeParam } from 'antd/lib/upload';

import { Icon } from '@cognite/cogs.js';
import { trackEvent } from '@cognite/cdf-route-tracker';
import styled from 'styled-components';
import { getContainer, sleep } from 'utils/utils';
import { useSDK } from '@cognite/sdk-provider';
import { useActiveTableContext } from 'contexts';

const { Dragger } = Upload;

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const sdk = useSDK();
  const { database, table } = useActiveTableContext();
  const [file, setFile] = useState<File | undefined>();
  const [upload, setUpload] = useState(false);
  const [complete, setComplete] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [columns, setColumns] = useState<string[] | undefined>();

  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);
  const [parser, setParser] = useState<PapaParse.Parser | undefined>();
  const [uploadedCursor, setUploadedCursor] = useState(0);
  const [parsedCursor, setParsedCursor] = useState(0);

  useEffect(
    () => () => {
      if (parser) {
        parser.abort();
      }
    },
    [parser]
  );

  useEffect(() => {
    if (complete) {
      if (file) {
        if (networkError) {
          notification.error({
            message: `${file.name} is not uploaded!`,
            key: 'file-upload',
          });
        } else {
          notification.success({
            message: `${file.name} is uploaded!`,
            key: 'file-upload',
          });
        }
      }
    }
  }, [complete, file, networkError]);

  useEffect(() => {
    if (file) {
      PapaParse.parse(file, {
        step(result, _parser) {
          setColumns(result.data as string[]);
          _parser.abort();
        },
        complete: () => {},
      });
    }
  }, [file]);

  useEffect(() => {
    if (file && upload) {
      PapaParse.parse<any>(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk(results, _parser) {
          setParser(_parser);
          _parser.pause();
          setParsedCursor(results.meta.cursor);
          const items = new Array(results.data.length);
          results.data.forEach((row: string[], rowIndex) => {
            const rowcolumns: any = {};
            columns?.forEach((column, index) => {
              rowcolumns[column] = row[index];
            });
            items[rowIndex] = {
              key:
                selectedKeyIndex === -1
                  ? uuid()
                  : row[selectedKeyIndex].toString(),
              columns: rowcolumns,
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
    }
  }, [file, upload, columns, selectedKeyIndex, database, table]);

  const saveDataToApi = async () => {
    trackEvent('RAW.Explorer.CSVUpload.Upload');
    setUpload(true);
  };

  const checkAndReturnCols = () => {
    if (columns && columns.length > 0) {
      return (
        <div>
          {columns.map((col) => (
            <Tag style={{ margin: '5px' }} key={col}>
              {col}
            </Tag>
          ))}
          <div style={{ marginTop: '20px' }}>
            <p>Select a column to use as a unique key for the table</p>
            Unique Key Column :{' '}
            <Select
              defaultValue="-1"
              style={{ width: '60%' }}
              value={String(selectedKeyIndex)}
              onChange={(val: string) => setSelectedKeyIndex(Number(val))}
              getPopupContainer={getContainer}
            >
              <Select.Option value="-1" key="-1">
                Generate a new Key Column
              </Select.Option>
              {columns.map((col, index) => (
                <Select.Option key={String(index)} value={String(index)}>
                  {col}
                </Select.Option>
              ))}
            </Select>
            {selectedKeyIndex === -1 && (
              <Alert
                style={{ marginTop: '20px' }}
                type="info"
                message="Please note that choosing the auto generated key column option, will clear all existing data in the table"
              />
            )}
          </div>
        </div>
      );
    }
    return undefined;
  };
  const fileProps = {
    name: 'file',
    multiple: false,
    handleManualRemove() {
      setFile(undefined);
    },
    accept: '.csv',
    onChange(info: UploadChangeParam) {
      setFile(info.file.originFileObj);
    },
  };

  const renderModalContent = () => {
    if (file) {
      if (upload) {
        return (
          <ContentWrapper>
            <p> Uploading csv...</p>
            <Progress
              type="line"
              percent={Math.floor((parsedCursor / file.size) * 100)}
              success={{
                percent: Math.floor((uploadedCursor / file.size) * 100),
              }}
              format={() => `${Math.floor(uploadedCursor / 2 ** 20)}MB`}
            />
          </ContentWrapper>
        );
      }
      return (
        <ContentWrapper>
          <p>The file uploaded contains the following columns: </p>
          {columns && columns?.length > 0 ? (
            checkAndReturnCols()
          ) : (
            <Icon type="Loading" />
          )}
        </ContentWrapper>
      );
    }
    return (
      <Dragger {...fileProps}>
        <p className="ant-upload-drag-icon">
          <Icon size={24} type="Upload" />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          The first row in the CSV file must contain all{' '}
          <strong>table column names</strong>. <br />
          Each column with data must have a corresponding column title.
        </p>
      </Dragger>
    );
  };

  return (
    <Modal
      visible
      title="Upload CSV file"
      onCancel={() => {
        if (file && parser && !complete) {
          notification.info({
            message: `File upload was canceled.`,
            key: 'file-upload',
          });
        }
        setCSVModalVisible(false, upload);
      }}
      okText="Confirm Upload"
      onOk={() => saveDataToApi()}
      okButtonProps={{
        loading: upload,
        disabled: !file || upload,
      }}
      getContainer={getContainer}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default UploadCSV;

const ContentWrapper = styled.div`
  float: center;
`;
