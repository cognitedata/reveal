import React, { useCallback, useEffect, useState } from 'react';

import uuid from 'uuid';
import PapaParse from 'papaparse';

import { message, Progress, Tag, Select, Alert, Modal, Upload } from 'antd';

import { UploadChangeParam } from 'antd/lib/upload';

import { Icon } from '@cognite/cogs.js';
import { trackEvent } from '@cognite/cdf-route-tracker';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import { useInsertRows } from 'hooks/sdk-queries';

const { Dragger } = Upload;

interface UploadCsvProps {
  table: string;
  database: string;
  csvModalVisible: boolean;
  setCSVModalVisible(value: boolean): void;
}

const UploadCSV = ({
  csvModalVisible,
  setCSVModalVisible,
  database,
  table,
}: UploadCsvProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [upload, setUpload] = useState(false);
  const [complete, setComplete] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [columns, setColumns] = useState<string[] | undefined>();

  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);
  const [parser, setParser] = useState<PapaParse.Parser | undefined>();
  const [cursor, setCursor] = useState(0);

  const { mutate, isLoading, reset } = useInsertRows();

  const resetState = useCallback(() => {
    setCSVModalVisible(false);
    setComplete(false);
    setCursor(0);
    setFile(undefined);
    setUpload(false);
    setNetworkError(false);
    reset();
  }, [setCSVModalVisible, setComplete, setCursor, setFile, setUpload, reset]);

  useEffect(() => {
    if (complete) {
      if (file) {
        if (networkError) {
          message.error({
            content: `${file.name} is not uploaded!`,
            key: 'file-upload',
          });
        } else {
          message.success({
            content: `${file.name} is uploaded!`,
            key: 'file-upload',
          });
        }
      }
      resetState();
    }
  }, [complete, file, networkError, resetState]);

  useEffect(() => {
    if (!csvModalVisible && parser && parser.abort) {
      parser.abort();
    }
  }, [csvModalVisible, parser]);

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
          const items = results.data.map((row: string[]) => {
            const rowcolumns = columns
              ? columns.reduce(
                  (accl, c, i) => ({
                    ...accl,
                    [c]: row[i],
                  }),
                  {}
                )
              : {};
            return {
              key:
                selectedKeyIndex === -1
                  ? uuid()
                  : row[selectedKeyIndex].toString(),
              columns: rowcolumns,
            };
          });

          mutate(
            { items, database, table },
            {
              onSuccess() {
                setCursor(results.meta.cursor);
                _parser.resume();
              },
              onError() {
                setNetworkError(true);
                _parser.abort();
              },
            }
          );
        },
        beforeFirstChunk(chunk) {
          return chunk.split('\n').splice(1).join('\n');
        },

        error() {
          message.error({
            content: `${file.name} could not be parsed!`,
            key: 'file-upload',
          });
          resetState();
        },
        complete() {
          setComplete(true);
        },
      });
    }
  }, [
    file,
    networkError,
    upload,
    columns,
    mutate,
    selectedKeyIndex,
    database,
    table,
    resetState,
    // setCSVModalVisible,
  ]);

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
              percent={Math.floor((cursor / file.size) * 100)}
              format={() => `${Math.floor(cursor / 2 ** 20)}MB`}
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
      visible={csvModalVisible}
      title="Upload CSV file"
      onCancel={() => {
        resetState();
      }}
      okText="Confirm Upload"
      onOk={() => saveDataToApi()}
      okButtonProps={{
        loading: upload,
        disabled: !file || isLoading || upload,
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
