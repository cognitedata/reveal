import React, { useState } from 'react';
import {
  validImgTypes,
  validateFileType,
  validateFileSize,
  NEW_FILE_KEY,
} from 'utils/files';
import {
  UploadFileNameContainer,
  UploadImageContainer,
} from 'components/forms/elements';
import { Icon, Tooltip, Tag } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { filesUploadState, imageFileState } from 'store/forms/selectors';
import { boardValidator } from 'validators';
import { useMetrics } from 'utils/metrics';
import { addFileToDeleteQueue } from 'store/forms/actions';
import { FieldProps } from 'formik';

type Props = {
  setCustomErrors: (errors: any) => void;
  itemKey?: string;
  labelText: string;
  filesUploadQueue: Map<string, File>;
};

export const FileUpload: React.FC<Props & FieldProps<string | undefined>> = ({
  itemKey,
  labelText,
  setCustomErrors,
  field: { name, value: imageFileId = '' },
  form: { errors, setTouched },
  filesUploadQueue,
}) => {
  const dispatch = useDispatch();
  const { loading, fileInfo: currentFileInfo } = useSelector(imageFileState);
  const { deleteQueue } = useSelector(filesUploadState);
  const metrics = useMetrics('EditSuite');
  const [uploadQueuedName, setUploadQueuedName] = useState('');
  const inDeleteQueue = deleteQueue.includes(imageFileId);
  const error = errors[name];
  const fileName = filesUploadQueue.get(itemKey || NEW_FILE_KEY)?.name || '';
  if (uploadQueuedName !== fileName) {
    setUploadQueuedName(fileName);
  }

  const handleFileInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files && e.currentTarget.files[0];
    if (!file) {
      return;
    }
    if (!validateFileType(file)) {
      setCustomErrors({
        [name]: boardValidator.imageFileId?.mimeType?.message,
      });
      setTouched({ [name]: true }, true);
      metrics.track('FileUploadValidationError_FileType', {
        fileType: file?.type,
      });
      return;
    }
    if (!validateFileSize(file)) {
      setCustomErrors({ [name]: boardValidator.imageFileId?.maxSize?.message });
      setTouched({ [name]: true }, true);
      metrics.track('FileUploadValidationError_MaxSize', {
        fileSize: file?.size,
      });
      return;
    }
    setCustomErrors({ [name]: undefined });
    filesUploadQueue.set(itemKey || NEW_FILE_KEY, file);
    setUploadQueuedName(file.name);
    setTouched({ [name]: true }, true);

    metrics.track('FileUpload', {
      fileSize: file?.size,
      fileType: file?.type,
    });
    e.currentTarget.value = ''; // reset the input
  };

  const cancelUpload = () => {
    const key = itemKey || NEW_FILE_KEY;
    key && filesUploadQueue.delete(key);
    setUploadQueuedName('');
  };

  const deleteCurrentFile = () => {
    dispatch(addFileToDeleteQueue(imageFileId));
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
        {loading && <Icon type="Loader" />}
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
          <span className="error-space">{error as any}</span>
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
        <span>{labelText}</span>
        <Icon type="ChevronRight" />
      </label>
      {renderFileNameContainer()}
    </UploadImageContainer>
  );
};
