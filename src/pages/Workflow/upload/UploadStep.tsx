import { FileUploader } from 'src/components/FileUploader';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { Detail, Title } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { addUploadedFile } from 'src/store/uploadedFilesSlice';

const FileUploaderWrapper = styled.div`
  margin: ${margin.default} 0;
`;

export default function UploadStep() {
  const dispatch = useDispatch();
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
    },
    [dispatch]
  );

  return (
    <>
      <Title level={2}>Upload file</Title>

      <FileUploaderWrapper>
        <FileUploader
          initialUploadedFiles={uploadedFiles}
          accept={['.jpeg', '.jpg', '.png', '.tiff'].join(', ')}
          maxTotalSizeInBytes={5 * 1024 ** 3 /* 5 GB */}
          onUploadSuccess={onUploadSuccess}
        >
          <AcceptMessage>
            <b>* Supported files: </b>
            jpeg, png, tiff. Total size limit: 5 GB.
          </AcceptMessage>
        </FileUploader>
      </FileUploaderWrapper>
    </>
  );
}

const AcceptMessage = styled(Detail)`
  text-align: right;
  color: #8c8c8c;
  opacity: 0.8;
  align-self: flex-end;
  width: 100%;
`;
