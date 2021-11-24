import React, { useState } from 'react';

import { UploadChangeParam } from 'antd/lib/upload';
import {
  notification,
  Progress,
  Tag,
  Select,
  Alert,
  Modal,
  Upload,
} from 'antd';

import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';

import { useTableData } from 'hooks/table-data';
import { useCSVUpload } from 'hooks/csv-upload';

const { Dragger } = Upload;

interface UploadCsvProps {
  setCSVModalVisible(value: boolean, tableChanged?: boolean): void;
}

const UploadCSV = ({ setCSVModalVisible }: UploadCsvProps) => {
  const [file, setFile] = useState<File | undefined>();
  const { columns } = useTableData();
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(-1);
  const {
    parsePercentage,
    uploadPercentage,
    uploadSize,
    columnHeaders,
    isUpload,
    isUploadFinished,
    isParsing,
    onConfirmUpload,
  } = useCSVUpload(file, selectedKeyIndex);

  const checkAndReturnCols = () => {
    if (columnHeaders && columnHeaders.length > 0) {
      return (
        <div>
          {columnHeaders.map((header: string) => (
            <Tag style={{ margin: '5px' }} key={header}>
              {header}
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
              {columnHeaders.map((header: string, index: number) => (
                <Select.Option key={String(index)} value={String(index)}>
                  {header}
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
      if (isUpload) {
        return (
          <ContentWrapper>
            <p> Uploading csv...</p>
            <Progress
              type="line"
              percent={parsePercentage}
              success={{ percent: uploadPercentage }}
              format={() => `${uploadSize}MB`}
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
        if (file && isParsing && !isUploadFinished) {
          notification.info({
            message: `File upload was canceled.`,
            key: 'file-upload',
          });
        }
        setCSVModalVisible(false, isUpload);
      }}
      okText="Confirm Upload"
      onOk={onConfirmUpload}
      okButtonProps={{
        loading: isUpload,
        disabled: !file || isUpload,
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
