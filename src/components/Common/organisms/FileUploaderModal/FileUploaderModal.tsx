import React, { useState } from 'react';
import { FileInfo } from 'cognite-sdk-v3';
import { Modal } from 'antd';
import { Button, Body } from '@cognite/cogs.js';
import Table from 'react-base-table';
import styled from 'styled-components';
import { FileUploader } from 'components/Common';
import { trackUsage } from 'utils/Metrics';
import AutoSizer from 'react-virtualized-auto-sizer';

// TODO(DE-142) clean up table utils
const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

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
            setFileList([...fileList, file]);
          }}
          beforeUploadStart={() => {
            trackUsage('File.Create.StartUpload', {});
            setFileList([]);
          }}
        >
          <>
            {fileList.length !== 0 && (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <Table
                    width={width}
                    height={300}
                    columns={[
                      {
                        title: 'File Name',
                        key: 'name',
                        dataKey: 'name',
                        headerRenderer,
                        width: 200,
                      },
                      {
                        title: 'File Type',
                        key: 'type',
                        dataKey: 'mimeType',
                        headerRenderer,
                        width: 200,
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        width: 200,
                        headerRenderer,
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
              </AutoSizer>
            )}
          </>
        </FileUploader>
      </Wrapper>
    </Modal>
  );
};
