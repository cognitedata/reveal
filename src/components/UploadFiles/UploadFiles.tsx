import { Dispatch, SetStateAction, useState } from 'react';
import { UploadChangeParam, UploadProps } from 'antd/lib/upload';
import { notification, Popconfirm, Upload } from 'antd';
import List from 'antd/lib/list';
import Spin from 'antd/lib/spin';
import { Button, Icon } from '@cognite/cogs.js';
import { trackEvent } from '@cognite/cdf-route-tracker';
import isString from 'lodash/isString';
import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { UploadFile } from 'antd/lib/upload/interface';
import { ErrorMessageBox } from 'components/ErrorMessage/ErrorMessage';
import { TranslationKeys } from 'common/i18n';
import { FileInfo } from 'utils/types';
import { getContainer, nameToAclTypeMap } from 'utils/shared';
import { useTranslation } from 'common/i18n';

interface UploadFileProps {
  setFileList: Dispatch<SetStateAction<FileInfo[]>>;
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
      notification.error({
        message:
          error.message ||
          error.errors.map((err: any) => err.message) ||
          'Something went wrong...',
      });
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

const createDataSet = async (_t: (key: TranslationKeys) => string) => {
  try {
    const [createdDataSet] = await sdk.datasets.create([
      {
        externalId: 'COGNITE_GENERATED_SYSTEM_FILES',
        name: 'COGNITE_GENERATED_SYSTEM_FILES',
        description: _t(
          'this-data-set-contains-files-uploaded-as-documentation'
        ),
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

const addFileToSystemSet = async (
  filedId: number,
  _t: (key: TranslationKeys) => string
) => {
  const dataSetId = (await getDataSetId()) || (await createDataSet(_t));
  if (dataSetId) {
    updateFileWithDataSet(filedId, dataSetId);
  }
};

const UploadFiles = ({
  fileList,
  setFileList,
  setChangesSaved,
}: UploadFileProps): JSX.Element => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const filesReadCapability = usePermissions(
    flow,
    nameToAclTypeMap.files,
    'READ'
  );
  const isMissingReadAccess =
    !filesReadCapability.isFetching && !filesReadCapability.data;
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getDownloadUrl = async (fileId: number) => {
    const links = await sdk.files.getDownloadUrls([{ id: fileId }]);

    if (links.length === 0) {
      return null;
    }

    return links[0].downloadUrl;
  };

  const uploadProps: UploadProps = {
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
        notification.success({
          message: t('upload-file-msg-success', { name: info.file.name }),
        });
      } else if (status === 'error') {
        notification.error({
          message: t('upload-file-msg-failed', { name: info.file.name }),
        });
      }
    },
    customRequest: ({ file, onSuccess, onError }) => {
      if (isString(file)) return;
      trackEvent('DataSets.CreationFlow.Uploaded documentation file', {
        type: file.type ? file.type : '',
      });
      const fileName = 'name' in file ? file.name : 'Uploaded file';
      sdk.files
        .upload({
          name: fileName,
          mimeType: file.type === '' ? undefined : file.type,
          source: 'Cognite Data Fusion',
        })
        .then((response: any) => {
          const fileId = response.id;
          addFileToSystemSet(fileId, t);
          if (response.uploadUrl) {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', response.uploadUrl, true);
            xhr.onload = () => {
              const { status } = xhr;
              if (status >= 200 && status < 300) {
                setUploadError(null);
                notification.success({
                  message: t('upload-file-msg-uploaded'),
                });
                setIsUploading(false);
                if (onSuccess) onSuccess('Ok', xhr);
                setFileList([{ name: fileName, id: fileId }, ...fileList]);
              } else {
                notification.error({ message: t('something-went-wrong') });
              }
            };
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          }
        })
        .catch(() => {
          setUploadError(t('upload-file-msg-error'));
          setIsUploading(false);
          if (onError) onError(new Error(t('upload-failed')));
        });
    },
  };

  const removeFileFromDataSet =
    (file: FileInfo): (() => void) =>
    () => {
      setChangesSaved(false);
      setFileList((prevFileList) =>
        prevFileList.filter((testFile) => testFile.id !== file.id)
      );
    };

  return (
    <div>
      {uploadError && (
        <div css="margin: 1rem 0;">
          <ErrorMessageBox>{uploadError}</ErrorMessageBox>
        </div>
      )}
      <Upload.Dragger {...uploadProps}>
        {!isUploading ? (
          <>
            <p className="ant-upload-drag-icon">
              <Icon type="Upload" />
            </p>
            <p className="ant-upload-text">{t('upload-file-click-or-drag')}</p>
          </>
        ) : (
          <Spin />
        )}
      </Upload.Dragger>
      {isMissingReadAccess && (
        <div css="margin: 1rem 0;">
          <ErrorMessageBox>{t('upload-file-no-access')}</ErrorMessageBox>
        </div>
      )}
      <List>
        {fileList.map((file) => (
          <List.Item key={file.id}>
            <Button
              type="link"
              disabled={isMissingReadAccess}
              onClick={async () => {
                const url = await getDownloadUrl(file.id);
                if (url) {
                  window.open(url);
                }
              }}
            >
              {file.name}
            </Button>
            <Popconfirm
              getPopupContainer={getContainer}
              onConfirm={removeFileFromDataSet(file)}
              placement="topLeft"
              title={t('upload-file-remove-file-confirm', {
                fileName: file.name,
              })}
            >
              <Button icon="Delete" type="ghost" />
            </Popconfirm>
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default UploadFiles;
