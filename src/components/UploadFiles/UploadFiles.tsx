import React, { useState } from 'react';
import Upload, { UploadChangeParam } from 'antd/lib/upload';
import message from 'antd/lib/message';
import List from 'antd/lib/list';
import Spin from 'antd/lib/spin';
import { Button, Icon } from '@cognite/cogs.js';
import { trackEvent } from '@cognite/cdf-route-tracker';

import sdk from '@cognite/cdf-sdk-singleton';

import { UploadFile } from 'antd/lib/upload/interface';
import { FileInfo } from '../../utils/types';

const { Dragger } = Upload;

interface UploadProps {
  setFileList(value: FileInfo[]): void;
  fileList: FileInfo[];
  setChangesSaved(value: boolean): void;
}

const updateFileWithDataSet = (fileId: number, dataSetId: number) => {
  sdk
    .post(`/api/v1/projects/${sdk.project}/files/update`, {
      data: {
        items: [
          {
            id: fileId,
            update: {
              dataSetId: {
                set: dataSetId,
              },
            },
          },
        ],
      },
    })
    .catch((error) => {
      message.error(
        error.message ||
          error.errors.map((err: any) => err.message) ||
          'Something went wrong...'
      );
    });
};

const getDataSetId = async () => {
  try {
    const [dataSet] = await sdk.datasets.retrieve([
      { externalId: 'COGNITE_GENERATED_SYSTEM_FILES' },
    ]);
    return dataSet.id;
  } catch (e) {
    return null;
  }
};

const createDataSet = async () => {
  try {
    const [createdDataSet] = await sdk.datasets.create([
      {
        externalId: 'COGNITE_GENERATED_SYSTEM_FILES',
        name: 'COGNITE_GENERATED_SYSTEM_FILES',
        description:
          'This data set contains files uploaded as documentation for other data sets.',
        metadata: {
          consoleCreatedBy: JSON.stringify({
            username: 'Cognite Data Fusion',
          }),
          consoleLabels: JSON.stringify(['COGNITE', 'SYSTEM']),
        },
      },
    ]);
    return createdDataSet.id;
  } catch (e) {
    return null;
  }
};

const addFileToSystemSet = async (filedId: number) => {
  const dataSetId = (await getDataSetId()) || (await createDataSet());
  if (dataSetId) {
    updateFileWithDataSet(filedId, dataSetId);
  }
};

const UploadFiles = ({
  fileList,
  setFileList,
  setChangesSaved,
}: UploadProps): JSX.Element => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadFile = async (request: any) => {
    const { file } = request;
    trackEvent('DataSets.CreationFlow.Uploaded documentation file', {
      type: file.type ? file.type : '',
    });
    sdk.files
      .upload({
        name: file.name,
        mimeType: file.type === '' ? undefined : file.type,
        source: 'Cognite Data Fusion',
      })
      .then((response: any) => {
        const fileId = response.id;
        addFileToSystemSet(fileId);
        if (response.uploadUrl) {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', response.uploadUrl, true);
          xhr.onload = () => {
            const { status } = xhr;
            if (status === 200) {
              message.success('File is uploaded');
              setIsUploading(false);
              request.onSuccess();
              setFileList([{ name: file.name, id: fileId }, ...fileList]);
            } else {
              message.error('Something went wrong!');
            }
          };
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        }
      })
      .catch(() => {
        request.onError();
      });
  };

  const getDownloadUrl = async (fileId: number) => {
    const links = await sdk.files.getDownloadUrls([{ id: fileId }]);

    if (links.length === 0) {
      return null;
    }

    return links[0].downloadUrl;
  };

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    disabled: isUploading,
    multiple: true,
    onChange(info: UploadChangeParam<UploadFile>) {
      setChangesSaved(false);
      const { status } = info.file;
      if (status === 'uploading' && !isUploading) {
        setIsUploading(true);
      }
      if (status === 'done') {
        // setFileList([{ name: file.name, id: info.file. }, ...fileList]);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    customRequest: (request: any) => uploadFile(request),
  };

  return (
    <div>
      <Dragger {...uploadProps}>
        {!isUploading ? (
          <>
            <p className="ant-upload-drag-icon">
              <Icon type="Upload" />
            </p>
            <p className="ant-upload-text">
              Click to select a file or drag it here to upload.
            </p>
          </>
        ) : (
          <Spin />
        )}
      </Dragger>
      <List>
        {fileList.map((file) => (
          <List.Item key={file.id}>
            <Button
              type="link"
              onClick={async () => {
                const url = await getDownloadUrl(file.id);
                if (url) {
                  window.open(url);
                }
              }}
            >
              {file.name}
            </Button>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default UploadFiles;
