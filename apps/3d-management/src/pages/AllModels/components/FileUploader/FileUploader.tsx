import React from 'react';
import { Upload, Modal, message } from 'antd';
import { Button } from '@cognite/cogs.js';

import UploadGCS from '@cognite/gcs-browser-upload';
import mime from 'mime-types';
import styled from 'styled-components';
import { FileInfo, FileUploadResponse } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification, logToSentry } from 'utils/notifications';
import { DEFAULT_MARGIN_V, getContainer, sleep } from 'utils';
import { FileAddOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { confirm } = Modal;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;

  button:not(:first-child) {
    align-self: start;
    margin-right: 0;
    margin-left: 10px;
  }

  button:last-child {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }
`;

enum STATUS {
  WAITING = 1,
  READY,
  STARTING,
  STARTED,
  PAUSED,
}

const defaultState = {
  uploadStatus: STATUS.WAITING,
  fileList: undefined,
};

type Props = {
  onUploadSuccess: (fileId: number) => void;
  onUploadFailure: () => void;
  onCancel: () => void;
  beforeUploadStart?: () => Promise<void>;
};

type State = {
  uploadStatus: STATUS;
  fileList?: Array<any>;
  supportedExtensions: Array<string>;
};

// fixme[D3M-23] - currently it requires Modal wrapper and it causes different handling of modal closing
//  here is the cancel button, but Modal still can be closed by clicking outside of it and it isn't handled
class FileUploader extends React.Component<Props, State> {
  currentUpload: UploadGCS | null = null;

  constructor(props) {
    super(props);
    this.fetchSupportedExtensions();
    this.state = {
      ...defaultState,
      supportedExtensions: [],
    };
  }

  static state = {
    ...defaultState,
    supportedExtensions: [],
  };

  getMIMEType = (fileURI) => mime.lookup(fileURI) || 'application/octet-stream';

  setupFilesBeforeUpload = (file) => {
    if (
      this.state.supportedExtensions === undefined ||
      this.state.supportedExtensions.length === 0 ||
      this.state.supportedExtensions.includes(
        file.name.split('.').pop().toLowerCase()
      )
    ) {
      this.setState({
        fileList: [file],
        uploadStatus: STATUS.READY,
      });
    } else {
      this.setState(defaultState);
      fireErrorNotification({
        message: `${file.name} has an invalid extension`,
      });
    }

    // false stops them from automatically using their upload functionaility
    return false;
  };

  fetchSupportedExtensions = async () => {
    const supportedExtensions: Array<string> = [];

    // This end point is hidden and not in the SDK.
    const response = await sdk.get(
      `api/v1/projects/${sdk.project}/3d/supportedfileformats`
    );
    response.data.items.forEach((fileFormat) => {
      fileFormat.extensions.forEach((extension) => {
        supportedExtensions.push(extension);
      });
    });

    this.setState({ supportedExtensions });
  };

  startUpload = async () => {
    this.setState({ uploadStatus: STATUS.STARTING });

    if (this.props.beforeUploadStart) {
      try {
        await this.props.beforeUploadStart();
      } catch (e) {
        this.props.onUploadFailure();
        this.setState({ uploadStatus: STATUS.READY });
        return;
      }
    }

    message.info('Starting Upload...');
    const file = this.state.fileList![0];
    const mimeType = this.getMIMEType(file.name);

    const { uploadUrl, id } = (await sdk.files.upload({
      name: file.name,
      mimeType,
      source: '3d-models',
    })) as FileUploadResponse;

    if (!uploadUrl || !id) {
      this.props.onUploadFailure();
      return;
    }

    const chunkMultiple = Math.min(
      Math.max(
        5, // min chunk is 1.25 MB
        Math.ceil(file.size / 20 / 262144) // divide into 20 segments and take multiplier
      ),
      200 // 50 MB max
    );
    const chunkSize = 262144 * chunkMultiple;

    this.currentUpload = new UploadGCS({
      id: 'file',
      url: uploadUrl,
      file,
      contentType: mimeType,
      chunkSize,

      onChunkUpload: (info) => {
        if (file.status !== 'uploading') {
          file.status = 'uploading';
        }
        file.response = info;
        file.percent = (info.uploadedBytes / info.totalBytes) * 100;

        // we need to trigger state update to see file.percent updates
        this.setState((prev) => ({
          ...prev,
          fileList: [...(prev.fileList || [])],
        }));
      },
    });

    this.setState({ uploadStatus: STATUS.STARTED });

    try {
      await this.currentUpload!.start();

      // Files are not available through the files API immediately after upload
      // so we making sure that they are available to avoid revisions endpoint to fail
      const getFileInfo = (): Promise<FileInfo> =>
        sdk.files.retrieve([{ id }]).then((r) => r[0]);

      let fileInfo = await getFileInfo();
      let retries = 0;
      while (!fileInfo.uploaded && retries <= 3) {
        retries += 1;
        /* eslint-disable no-await-in-loop */
        await sleep(retries * 1500);
        fileInfo = await getFileInfo();
        /* eslint-enable no-await-in-loop */
      }
      if (!fileInfo.uploaded) {
        throw new Error(`File with id=${id} is never marked as uploaded`);
      }
      this.props.onUploadSuccess(fileInfo.id);
    } catch (e) {
      if (e.code === 401) {
        // eslint-disable-next-line no-alert
        alert('Authorization is expired. The page will be reloaded');

        // eslint-disable-next-line no-restricted-globals
        location.reload();
      } else {
        logToSentry(e);
        message.error(`Unable to upload ${file.name} on server.`);
      }
    }

    this.currentUpload.meta.reset(); // clears the locally stored metadata
    this.setState(defaultState);
  };

  onCancelClicked = () => {
    if (
      this.state.uploadStatus === STATUS.PAUSED ||
      this.state.uploadStatus === STATUS.STARTED
    ) {
      confirm({
        title: 'Do you want to cancel the job?',
        content: 'If you cancel, the file upload will be cancelled!',
        onOk: () => {
          this.currentUpload.cancel();
          this.currentUpload.meta.reset();
          this.setState(defaultState);
        },
        getContainer,
      });
    } else {
      // modal closed
      if (this.currentUpload) {
        this.currentUpload.cancel();
        this.currentUpload.meta.reset();
      }
      this.props.onCancel();
      this.setState(defaultState);
    }
  };

  pauseUpload = () => {
    if (this.state.uploadStatus === STATUS.STARTED) {
      this.currentUpload.pause();

      this.setState({
        uploadStatus: STATUS.PAUSED,
      });
    }
  };

  unpauseUpload = () => {
    if (this.state.uploadStatus === STATUS.PAUSED) {
      this.currentUpload.unpause();

      this.setState({
        uploadStatus: STATUS.STARTED,
      });
    }
  };

  removeFile = () => {
    this.setState(defaultState);
  };

  render() {
    let uploaderButton;

    switch (this.state.uploadStatus) {
      case STATUS.WAITING:
        uploaderButton = (
          <Button type="primary" icon="Upload" disabled>
            Upload
          </Button>
        );
        break;
      case STATUS.READY:
        uploaderButton = (
          <Button type="primary" onClick={this.startUpload} icon="Upload">
            Upload
          </Button>
        );
        break;
      case STATUS.STARTING:
        uploaderButton = (
          <Button type="primary" icon="Loader" disabled>
            Uploading
          </Button>
        );
        break;
      case STATUS.STARTED:
        uploaderButton = (
          <Button type="primary" onClick={this.pauseUpload} icon="Loader">
            Pause Upload
          </Button>
        );
        break;
      case STATUS.PAUSED:
        uploaderButton = (
          <Button type="primary" onClick={this.unpauseUpload}>
            Continue Upload
          </Button>
        );
        break;
      default:
        uploaderButton = null;
    }

    return (
      <div>
        <Dragger
          name="file"
          multiple={false}
          onRemove={this.removeFile}
          beforeUpload={this.setupFilesBeforeUpload}
          fileList={this.state.fileList}
        >
          <p className="ant-upload-drag-icon">
            <FileAddOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload, will begin upload when
            you click the Upload button.
          </p>
        </Dragger>
        <div
          style={{ marginTop: DEFAULT_MARGIN_V }}
        >{`Supported file formats: ${this.state.supportedExtensions.join()}.`}</div>
        <ButtonRow>
          <Button onClick={this.onCancelClicked}>Cancel</Button>
          {uploaderButton}
        </ButtonRow>
      </div>
    );
  }
}

export default FileUploader;
