import { FileUploadModalProps } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import React, { useState } from 'react';

let mockFileId = 0;
// allows the test to set uploaded file id
export const setMockFileId = (id: number) => {
  mockFileId = id;
};
const getMockFileId = () => {
  return mockFileId;
};

export const FileUploadModal = ({
  showModal,
  onUploadSuccess,
  onCancel,
  onFinishUploadAndProcess,
}: FileUploadModalProps) => {
  const fileId = getMockFileId();
  const [uploaded, setUploaded] = useState(false);

  const onUpload = () => {
    if (onUploadSuccess) {
      setMockFileId(fileId + 1);
      onUploadSuccess(fileId + 1);
      setUploaded(true);
    }
  };

  const onFinishUpload = () => {
    setUploaded(false);
    if (onFinishUploadAndProcess) {
      onFinishUploadAndProcess();
    }
  };
  if (showModal) {
    if (uploaded) {
      return (
        <div>
          <button
            type="submit"
            onClick={onFinishUpload}
            data-testid="finish-upload"
          >
            Finish Uploading
          </button>
        </div>
      );
    }
    return (
      <div>
        <button type="submit" onClick={onUpload} data-testid="upload">
          Upload Files
        </button>
        <button type="button" onClick={() => onCancel()} data-testid="cancel">
          Cancel
        </button>
      </div>
    );
  }
  return null;
};
