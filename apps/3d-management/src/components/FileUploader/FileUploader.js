import React from 'react';
import PropTypes from 'prop-types';
import Upload from 'antd/lib/upload';
import Icon from 'antd/lib/icon';
import { Button } from '@cognite/cogs.js';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import UploadGCS from 'gcs-browser-upload';
import mime from 'mime-types';
import styled from 'styled-components';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification } from 'utils/notifications';
import { getContainer } from 'utils';

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

const STATUS = Object.freeze({
  WAITING: 1,
  READY: 2,
  STARTED: 3,
  PAUSED: 4,
});

const defaultState = {
  uploadStatus: STATUS.WAITING,
  fileList: undefined,
  currentUpload: undefined,
};

class FileUploader extends React.Component {
  constructor(props) {
    super(props);
    this.currentUpload = null;
    this.fetchSupportedExtensions();
    // eslint-disable-next-line react/state-in-constructor
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
    const supportedExtensions = [];

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
    if (this.state.uploadStatus !== STATUS.READY) {
      return;
    }

    try {
      await this.props.beforeUploadStart();
    } catch (e) {
      this.props.onUploadFailure();
      return;
    }

    message.info('Starting Upload...');

    const { uploadUrl, id } = await sdk.files.upload({
      name: this.state.fileList[0].name,
      mimeType: this.getMIMEType(this.state.fileList[0].name),
      source: '3d-models',
    });

    if (!uploadUrl || !id) {
      this.props.onUploadFailure();
      return;
    }

    const chunkMultiple = Math.min(
      Math.max(
        2, // 0.5MB min chunks
        Math.ceil((this.state.fileList[0].size / 20) * 262144) // will divide into 20 segments
      ),
      200 // 50 MB max
    );

    this.currentUpload = new UploadGCS({
      id: 'file',
      url: uploadUrl,
      file: this.state.fileList[0],
      chunkSize: 262144 * chunkMultiple,
      onChunkUpload: (info) => {
        if (this.state.fileList[0].status !== 'uploading') {
          this.state.fileList[0].status = 'uploading';
        }
        this.state.fileList[0].response = info;
        this.state.fileList[0].percent =
          (info.uploadedBytes / info.totalBytes) * 100;

        this.setState((prevState) => ({ fileList: [prevState.fileList[0]] }));
      },
    });

    this.setState({ uploadStatus: STATUS.STARTED });

    try {
      await this.currentUpload.start();
    } catch (e) {
      // catch CORS errors
    }

    this.props.onUploadSuccess(id);

    message.success(
      'Upload complete, starting processing job to render 3d model!'
    );

    this.currentUpload.meta.reset(); // clears the locally stored metadata
    this.setState(defaultState);
  };

  stopUpload = () => {
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
        onCancel() {
          this.props.onCancel();
        },
        getContainer,
      });
    } else {
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
          onCancel={this.stopUpload}
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
        <div>{`Supported file formats: ${this.state.supportedExtensions.join()}.`}</div>
        <ButtonRow>
          <Button onClick={this.stopUpload}>Cancel</Button>
          {uploaderButton}
        </ButtonRow>
      </div>
    );
  }
}

FileUploader.propTypes = {
  onUploadSuccess: PropTypes.func,
  onUploadFailure: PropTypes.func,
  onCancel: PropTypes.func,
  beforeUploadStart: PropTypes.func,
};

FileUploader.defaultProps = {
  onUploadSuccess: () => {},
  onUploadFailure: () => {},
  onCancel: () => {},
  beforeUploadStart: () => true,
};

export default FileUploader;
