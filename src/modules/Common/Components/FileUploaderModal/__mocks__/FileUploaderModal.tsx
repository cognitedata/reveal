import { FileUploadModalProps } from 'src/modules/Common/Components/FileUploaderModal/FileUploaderModal';
import React, { useCallback, useState } from 'react';

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
  onFinishUpload,
}: FileUploadModalProps) => {
  const fileId = getMockFileId();
  const [uploaded, setUploaded] = useState(false);

  const onUpload = useCallback(() => {
    if (onUploadSuccess) {
      setMockFileId(fileId + 1);
      onUploadSuccess(fileId + 1);
      setUploaded(true);
    }
  }, [onUploadSuccess, fileId]);

  const onFinish = useCallback(() => {
    setUploaded(false);
    if (onFinishUpload) {
      onFinishUpload(false);
    }
  }, [onFinishUpload]);
  if (showModal) {
    if (uploaded) {
      return (
        <div>
          <button type="submit" onClick={onFinish} data-testid="finish-upload">
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
