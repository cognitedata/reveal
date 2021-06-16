import React, { useState } from 'react';
import {
  validImgTypes,
  validateFileType,
  validateFileSize,
  newFileKey,
} from 'utils/files';
import {
  UploadFileNameContainer,
  UploadImageContainer,
} from 'components/modals/elements';
import { Icon, Tooltip, Tag } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  boardState,
  filesUploadState,
  imageFileState,
} from 'store/forms/selectors';
import { Board } from 'store/suites/types';
import { boardValidator } from 'validators';
import { useMetrics } from 'utils/metrics';

import { addFileToDeleteQueue } from 'store/forms/actions';

type Props = {
  filesUploadQueue: Map<string, File>;
  setErrors: React.Dispatch<any>;
  error: string;
};

export const FileUpload: React.FC<Props> = ({
  filesUploadQueue,
  error,
  setErrors,
}) => {
  const dispatch = useDispatch();
  const {
    key: boardKey,
    title: boardTitle,
    imageFileId,
  } = useSelector(boardState) as Board;
  const { loading, fileInfo: currentFileInfo } = useSelector(imageFileState);
  const { deleteQueue } = useSelector(filesUploadState);
  const metrics = useMetrics('EditSuite');
  const [uploadQueuedName, setUploadQueuedName] = useState('');
  const fileName = filesUploadQueue.get(boardKey || newFileKey)?.name || '';
  if (uploadQueuedName !== fileName) {
    setUploadQueuedName(fileName);
  }

  const inDeleteQueue = deleteQueue.includes(imageFileId);

  const handleFileInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    if (!file) {
      return;
    }
    if (!validateFileType(file)) {
      setErrors((prevState: Board) => ({
        ...prevState,
        imageFileId: boardValidator.imageFileId?.mimeType?.message,
      }));
      metrics.track('FileUploadValidationError_FileType', {
        boardKey,
        board: boardTitle,
        fileType: file?.type,
      });
      return;
    }
    if (!validateFileSize(file)) {
      setErrors((prevState: Board) => ({
        ...prevState,
        imageFileId: boardValidator.imageFileId?.maxSize?.message,
      }));
      metrics.track('FileUploadValidationError_MaxSize', {
        boardKey,
        board: boardTitle,
        fileSize: file?.size,
      });
      return;
    }
    setErrors((prevState: Board) => ({
      ...prevState,
      imageFileId: '',
    }));
    filesUploadQueue.set(boardKey || newFileKey, file);
    setUploadQueuedName(file.name);

    metrics.track('FileUpload', {
      boardKey,
      board: boardTitle,
      fileOriginalName: file.name,
      fileSize: file?.size,
      fileType: file?.type,
    });
    e.currentTarget.value = ''; // reset the input
  };

  const cancelUpload = () => {
    const key = boardKey || newFileKey;
    key && filesUploadQueue.delete(key);
    setUploadQueuedName('');
    metrics.track('FileUpload_Cancel', {
      boardKey,
      board: boardTitle,
    });
  };

  const deleteCurrentFile = () => {
    dispatch(addFileToDeleteQueue(imageFileId));
    metrics.track('FileUpload_Delete', {
      boardKey,
      board: boardTitle,
    });
  };

  const renderFileName = (
    fname: string,
    onCloseFn: () => void,
    withTooltip = false
  ) => {
    const fileTag = (
      <Tag closable onClose={onCloseFn}>
        {fname}
      </Tag>
    );
    return (
      <UploadFileNameContainer>
        {loading && <Icon type="Loading" />}
        {withTooltip ? (
          <Tooltip content={fname}>{fileTag}</Tooltip>
        ) : (
          <>{fileTag}</>
        )}
      </UploadFileNameContainer>
    );
  };

  const renderFileNameContainer = () => {
    if (error) {
      return (
        <>
          {currentFileInfo?.name &&
            !inDeleteQueue &&
            renderFileName(currentFileInfo.name, deleteCurrentFile)}
          <span className="break" />
          <span className="error-space">{error}</span>
        </>
      );
    }
    if (uploadQueuedName) {
      return renderFileName(uploadQueuedName, cancelUpload, true);
    }
    if (currentFileInfo?.name && !inDeleteQueue) {
      return renderFileName(currentFileInfo.name, deleteCurrentFile);
    }
    return null;
  };

  return (
    <UploadImageContainer hasError={!!error}>
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
      {renderFileNameContainer()}
    </UploadImageContainer>
  );
};
