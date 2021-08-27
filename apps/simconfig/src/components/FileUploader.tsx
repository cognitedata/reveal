/* eslint no-param-reassign: ["error", { "props": false }] */
import React from 'react';
import { Upload, message } from 'antd';
import { Button, Modal } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';
import UploadGCS from '@cognite/gcs-browser-upload';
import noop from 'lodash/noop';
import styled from 'styled-components';
import { UploadFile } from 'antd/lib/upload/interface';
import { getMIMEType, UploadFileMetadataResponse } from 'utils/file';

export const GCSUploader = (
  file: Blob | UploadFile,
  uploadUrl: string,
  callback: (info: any) => void = noop
) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'simconfig-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};

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

const { Dragger } = Upload;

enum STATUS {
  WAITING,
  READY,
  STARTED,
  PAUSED,
}

type Props = {
  assetIds?: number[];
  validExtensions?: string[];
  onUploadSuccess: (file: UploadFileMetadataResponse) => void;
  onFileListChange: (fileList: UploadFile[]) => void;
  onUploadFailure: (error: string) => void;
  onCancel: () => void;
  beforeUploadStart: () => void;
};

type PropsFileUploader = Props & { client: CogniteClient };

type State = {
  uploadStatus: STATUS;
  fileList: UploadFile[];
};

const defaultState = {
  uploadStatus: STATUS.WAITING,
  fileList: [],
};

const FileUploaderWrapper: React.FC<Props> = (props) => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <FileUploader client={client} {...props} /> : null
    }
  </AuthConsumer>
);

class FileUploader extends React.Component<PropsFileUploader, State> {
  currentUploads: { [key: string]: any };

  // eslint-disable-next-line react/static-property-placement
  public static defaultProps = {
    onUploadSuccess: noop,
    onUploadFailure: message.error,
    onCancel: noop,
    beforeUploadStart: noop,
    onFileListChange: noop,
  };

  constructor(props: PropsFileUploader) {
    super(props);

    this.state = {
      uploadStatus: STATUS.WAITING,
      fileList: [],
    };
    this.currentUploads = {};
  }

  get uploadButtons() {
    let uploaderButton;

    switch (this.state.uploadStatus) {
      case STATUS.WAITING:
        uploaderButton = (
          <Button type="primary" disabled>
            Upload
          </Button>
        );
        break;
      case STATUS.READY:
        uploaderButton = (
          <>
            <Button type="primary" onClick={this.startUpload}>
              Upload
            </Button>
          </>
        );
        break;
      case STATUS.STARTED:
        uploaderButton = (
          <>
            <Button onClick={this.stopUpload}>Cancel Upload</Button>
            <Button type="primary" onClick={this.pauseUpload}>
              Pause Upload
            </Button>
          </>
        );
        break;
      case STATUS.PAUSED:
        uploaderButton = (
          <>
            <Button onClick={this.stopUpload}>Cancel Upload</Button>
            <Button type="primary" onClick={this.unpauseUpload}>
              Continue Upload
            </Button>
          </>
        );
        break;
      default:
        uploaderButton = null;
    }

    return <ButtonRow>{uploaderButton}</ButtonRow>;
  }

  setupFilesBeforeUpload = (file: any) => {
    if (
      this.props.validExtensions === undefined ||
      this.props.validExtensions.length === 0 ||
      this.props.validExtensions.includes(
        file.name.split('.').pop().toLowerCase()
      )
    ) {
      this.setState(
        (state) => ({
          ...state,
          fileList: [...state.fileList, file],
          uploadStatus: STATUS.READY,
        }),
        () => {
          this.props.onFileListChange(this.state.fileList);
        }
      );
    } else {
      this.setState(defaultState);
      message.error(`${file.name} has an invalid extension`);
    }

    // false stops them from automatically using their upload functionaility
    return false;
  };

  startUpload = async () => {
    const { assetIds } = this.props;
    if (this.state.uploadStatus !== STATUS.READY) {
      return;
    }

    try {
      this.props.beforeUploadStart();
    } catch (e) {
      this.props.onUploadFailure('Unable to start upload');
      return;
    }

    message.info('Starting Upload...');

    this.state.fileList.forEach(async (file) => {
      const mimeType = getMIMEType(file.name);
      if (!mimeType) {
        this.props.onUploadFailure(
          `Unable to detect file type for ${file.name}`
        );
        return;
      }

      const fileMetadata = (await this.props.client.files.upload({
        name: file.name,
        mimeType,
        source: 'Simulator Configuration',
        ...(assetIds && { assetIds }),
      })) as UploadFileMetadataResponse;
      const { uploadUrl, id } = fileMetadata;

      if (!uploadUrl || !id) {
        this.props.onUploadFailure('Unable to create file');
        return;
      }

      file.status = 'uploading';
      file.percent = 0;

      this.setState((state) => ({
        ...state,
        fileList: state.fileList.map((el) => {
          if (el.uid === file.uid) {
            return file;
          }
          return el;
        }),
      }));

      this.currentUploads[file.uid] = await GCSUploader(
        file,
        uploadUrl,
        (info: any) => {
          file.response = info;
          file.percent = (info.uploadedBytes / info.totalBytes) * 100;

          this.setState((state) => ({
            ...state,
            fileList: state.fileList.map((el) => {
              if (el.uid === file.uid) {
                return file;
              }
              return el;
            }),
          }));
        }
      );

      this.setState({ uploadStatus: STATUS.STARTED });

      try {
        await this.currentUploads[file.uid].start();
      } catch (e) {
        message.error('Unable to upload file to server.');
      }

      this.setState((state) => ({
        ...state,
        fileList: state.fileList.filter((el) => el.uid !== file.uid),
        uploadStatus:
          state.fileList.length === 1 ? STATUS.WAITING : state.uploadStatus,
      }));

      this.props.onUploadSuccess(fileMetadata);

      this.currentUploads[file.uid].meta.reset(); // clears the locally stored metadata
      this.setState({});
    });
  };

  stopUpload = () => {
    this.state.fileList.forEach((file) => {
      if (
        !(
          this.state.uploadStatus === STATUS.PAUSED ||
          this.state.uploadStatus === STATUS.STARTED
        )
      ) {
        if (this.currentUploads[file.uid]) {
          this.currentUploads[file.uid].cancel();
          this.currentUploads[file.uid].meta.reset();
        }
        this.props.onCancel();
        this.setState(defaultState);
      }
    });
  };

  pauseUpload = () => {
    if (this.state.uploadStatus === STATUS.STARTED) {
      this.state.fileList.forEach((file) => {
        this.currentUploads[file.uid].pause();
      });
      this.setState({
        uploadStatus: STATUS.PAUSED,
      });
    }
  };

  unpauseUpload = () => {
    if (this.state.uploadStatus === STATUS.PAUSED) {
      this.state.fileList.forEach((file) => {
        this.currentUploads[file.uid].unpause();
      });

      this.setState({
        uploadStatus: STATUS.STARTED,
      });
    }
  };

  removeFile = (file: UploadFile) => {
    this.setState(
      (state) => ({
        ...state,
        fileList: state.fileList.filter((el) => el.uid !== file.uid),
      }),
      () => {
        this.props.onFileListChange(this.state.fileList);
      }
    );
  };

  render() {
    return (
      <div>
        <Dragger
          name="file"
          onRemove={this.removeFile}
          beforeUpload={this.setupFilesBeforeUpload}
          fileList={this.state.fileList}
        >
          <p className="ant-upload-text">
            Click or drag file to this area to upload, will begin upload when
            you click the Upload button.
          </p>
        </Dragger>
        {this.props.children}
        {this.uploadButtons}
        {this.state.fileList.forEach((file) => {
          if (
            this.state.uploadStatus === STATUS.PAUSED ||
            this.state.uploadStatus === STATUS.STARTED
          ) {
            <Modal
              visible
              title="Do you want to cancel the file upload?"
              onOk={() => {
                this.currentUploads[file.uid].cancel();
                this.currentUploads[file.uid].meta.reset();
                this.setState(defaultState);
              }}
              onCancel={() => {
                this.props.onCancel();
                this.setState(defaultState);
              }}
            >
              If you cancel, the file upload will be cancelled!
            </Modal>;
          }
        })}
      </div>
    );
  }
}

export default FileUploaderWrapper;
