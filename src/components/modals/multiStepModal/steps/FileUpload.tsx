import React from 'react';
import {
  validImgTypes,
  validateFileType,
  validateFileSize,
  newFileKey,
} from 'utils/files';
import {
  UploadFileName,
  UploadImageContainer,
} from 'components/modals/elements';
import { Icon, Tooltip } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { boardState, imageFileState } from 'store/forms/selectors';
import { Board } from 'store/suites/types';
import { boardValidator } from 'validators';
import { useForm } from 'hooks';

type Props = {
  filesUploadQueue: Map<string, File>;
};

export const FileUpload: React.FC<Props> = ({ filesUploadQueue }) => {
  const { key: boardKey } = useSelector(boardState) as Board;
  const { loading, fileInfo: currentFileInfo } = useSelector(imageFileState);
  let uploadQueuedName = filesUploadQueue.get(boardKey || newFileKey)?.name;

  const { setErrors, errors } = useForm(boardValidator);

  const handleFileInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    if (!file) {
      return;
    }
    if (!validateFileType(file)) {
      setErrors((prevState: Board) => ({
        ...prevState,
        imageFileId: boardValidator.imageFile?.mimeType,
      }));
      return;
    }
    if (!validateFileSize(file)) {
      setErrors((prevState: Board) => ({
        ...prevState,
        imageFileId: boardValidator.imageFile?.maxSize?.message,
      }));
      return;
    }
    setErrors((prevState: Board) => ({
      ...prevState,
      imageFileId: '',
    }));
    filesUploadQueue.set(boardKey || newFileKey, file);
    uploadQueuedName = file.name;
  };

  const renderFileName = () => {
    if (errors?.imageFileId) {
      return (
        <>
          <span className="break" />
          <span className="error-space">{errors?.imageFileId}</span>
        </>
      );
    }
    if (uploadQueuedName) {
      return (
        <UploadFileName>
          <Tooltip content={uploadQueuedName}>
            <>{uploadQueuedName}</>
          </Tooltip>
        </UploadFileName>
      );
    }
    if (currentFileInfo?.name) {
      return (
        <UploadFileName>
          {loading && <Icon type="Loading" />}
          {currentFileInfo.name}
        </UploadFileName>
      );
    }
    return null;
  };

  return (
    <UploadImageContainer hasError={errors?.imageFileId}>
      <input
        type="file"
        name="uploadImage"
        id="uploadImage"
        accept={validImgTypes.join(',')}
        onChange={handleFileInputChange}
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="uploadImage">
        <span>Or upload an image</span>
        <Icon type="ChevronRightCompact" />
      </label>
      {renderFileName()}
    </UploadImageContainer>
  );
};
