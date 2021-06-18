import { FileUploader } from 'src/modules/Common/Components/FileUploader';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { Body, Detail, Tabs } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { addUploadedFile, selectAllFiles } from 'src/modules/Common/filesSlice';
import { pushMetric } from 'src/utils/pushMetric';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';

pushMetric('Vision.Upload');

const FileUploaderWrapper = styled.div`
  margin: ${margin.default} 0;
`;

export default function UploadStep() {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
      dispatch(RetrieveAnnotations([file.id]));
    },
    [dispatch]
  );

  return (
    <>
      <Tabs defaultActiveKey="upload">
        <Tabs.TabPane key="upload" tab={<Body level={1}>Upload files</Body>}>
          <FileUploaderWrapper>
            <FileUploader
              initialUploadedFiles={uploadedFiles}
              accept={['.jpeg', '.jpg', '.png', '.tiff', '.mp4'].join(', ')}
              maxTotalSizeInBytes={1 * 1024 ** 3 /* 1 GB */}
              maxFileCount={100}
              onUploadSuccess={onUploadSuccess}
            >
              <AcceptMessage>
                <b>* Supported files: </b>
                jpeg, png, tiff, mp4. Limit: 100 files with a total size of 1
                GB.
              </AcceptMessage>
            </FileUploader>
          </FileUploaderWrapper>
        </Tabs.TabPane>

        {/* <Tabs.TabPane
          key="existing"
          tab={<Body level={1}>Choose existing files</Body>}
        /> */}
      </Tabs>
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
