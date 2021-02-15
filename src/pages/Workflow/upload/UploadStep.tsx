import { FileUploader } from 'src/components/FileUploader';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { Detail } from '@cognite/cogs.js';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { addUploadedFile } from 'src/store/uploadedFilesSlice';

const supportedExtensions = ['jpeg', 'jpg', 'png', 'tiff'];

const FileUploaderWrapper = styled.div`
  max-width: 800px;
  margin: ${margin.default};
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
      <FileUploaderWrapper>
        <FileUploader
          validExtensions={supportedExtensions}
          onUploadSuccess={onUploadSuccess}
        >
          <Detail>Files supported: jpeg, png, tiff.</Detail>
        </FileUploader>

        <UploadedFilesInfo uploadedFiles={uploadedFiles} />
      </FileUploaderWrapper>
    </>
  );
}

function UploadedFilesInfo(props: { uploadedFiles: Array<v3.FileInfo> }) {
  let msg = '';
  if (props.uploadedFiles.length) {
    msg = `Files uploaded: ${props.uploadedFiles.length}`;
  }
  return (
    <div>
      <p>{msg}</p>
      <pre>{JSON.stringify(props.uploadedFiles, null, 2)}</pre>
    </div>
  );
}
