import React from 'react';
import Upload from 'antd/lib/upload';
import Icon from 'antd/lib/icon';
import { Button } from '@cognite/cogs.js';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import UploadGCS from 'gcs-browser-upload';
import mime from 'mime-types';
import styled from 'styled-components';
import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification } from 'src/utils/notifications';
import { DEFAULT_MARGIN_V, getContainer } from 'src/utils';

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
  READY = 2,
  STARTED = 3,
  PAUSED = 4,
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
    const response = await v3Client.get(
      `api/v1/projects/${v3Client.project}/3d/supportedfileformats`
    );
    response.data.items.forEach((fileFormat) => {
      fileFormat.extensions.forEach((extension) => {
        supportedExtensions.push(extension);
      });
    });

    this.setState({ supportedExtensions });
  };

  startUpload = async () => {
    if (this.state.uploadStatus !== STATUS.READY) {
      return;
    }

    if (this.props.beforeUploadStart) {
      try {
        await this.props.beforeUploadStart();
      } catch (e) {
        this.props.onUploadFailure();
        return;
      }
    }

    message.info('Starting Upload...');
    const file = this.state.fileList![0];

    const { uploadUrl, id } = (await v3Client.files.upload({
      name: file.name,
      mimeType: this.getMIMEType(file.name),
      source: '3d-models',
    })) as v3.FileUploadResponse;

    if (!uploadUrl || !id) {
      this.props.onUploadFailure();
      return;
    }

    const chunkMultiple = Math.min(
      Math.max(
        2, // 0.5MB min chunks
        Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
      ),
      200 // 50 MB max
    );

    this.currentUpload = new UploadGCS({
      id: 'file',
      url: uploadUrl,
      file,
      chunkSize: 262144 * chunkMultiple,
      onChunkUpload: (info) => {
        if (file.status !== 'uploading') {
          file.status = 'uploading';
        }
        file.response = info;
        file.percent = (info.uploadedBytes / info.totalBytes) * 100;
      },
    });

    this.setState({ uploadStatus: STATUS.STARTED });

    try {
      await this.currentUpload!.start();
    } catch (e) {
      // catch CORS errors
    }

    this.props.onUploadSuccess(id);

    message.info('Upload complete, starting processing job to render 3d model');

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
      case STATUS.STARTED:
        uploaderButton = (
          <Button type="primary" onClick={this.pauseUpload} icon="Loading">
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
            <Icon type="file-add" />
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
