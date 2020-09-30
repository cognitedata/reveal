import React, { useState } from 'react';
import { FileInfo } from 'cognite-sdk-v3';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { FileUploader, Table } from 'components/Common';
import { trackUsage } from 'utils/Metrics';

const Wrapper = styled.div`
  .wrapper {
    margin-top: 16px;
  }
  button {
    margin-top: 6px;
  }

  && .ant-select-selection__clear {
    background: none;
    right: 34px;
  }

  .link-text {
    margin-top: 6px;
    margin-bottom: 2px;
  }
`;

type Props = {
  onFileSelected: (file: FileInfo) => void;
  onCancel: () => void;
  visible?: boolean;
};

export const FileUploaderModal = ({
  onCancel,
  onFileSelected,
  visible = true,
}: Props) => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title="Upload File"
      footer={null}
    >
      <Wrapper>
        <FileUploader
          onUploadSuccess={file => {
            trackUsage('File.Create.UploadSuccess', { id: file.id });
            setFileList(list => [...list, file]);
          }}
          beforeUploadStart={() => {
            trackUsage('File.Create.StartUpload', {});
            setFileList([]);
          }}
        >
          <>
            {fileList.length !== 0 && (
              <Table
                height={300}
                columns={[
                  {
                    title: 'File name',
                    key: 'name',
                    dataKey: 'name',
                    width: 200,
                  },
                  {
                    title: 'File type',
                    key: 'type',
                    dataKey: 'mimeType',
                    width: 200,
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 200,
                    cellRenderer: ({
                      rowData: file,
                    }: {
                      rowData: FileInfo;
                    }) => {
                      return (
                        <Button onClick={() => onFileSelected(file)}>
                          View file
                        </Button>
                      );
                    },
                  },
                ]}
                rowKey="id"
                data={fileList}
              />
            )}
          </>
        </FileUploader>
      </Wrapper>
    </Modal>
  );
};
