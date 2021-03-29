import { FileUploader } from 'src/components/FileUploader';
import React from 'react';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { Detail, Title } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { addUploadedFile, selectAllFiles } from 'src/store/uploadedFilesSlice';
import { updateLinkedAssets } from 'src/store/thunks/updateLinkedAssets';

const FileUploaderWrapper = styled.div`
  margin: ${margin.default} 0;
`;

export default function UploadStep() {
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  // todo: remove this once development is complete
  // useEffect(() => {
  //   dispatch(
  //     fetchFilesById([
  //       { id: 6222346415226562 },
  //       { id: 3901383492989027 },

  // extra annotations
  // { id: 7962558153749325 },
  // { id: 8646165667023788 },
  // { id: 8733204951981 },
  // { id: 3209660507140892 },
  // { id: 8844487098733620 },
  // { id: 7727379776722125 },
  // { id: 7871961702513784 },
  // { id: 4286208028122389 },
  // { id: 8493116004320656 },
  // { id: 8617846943808843 },
  // { id: 8560196409695472 },
  // { id: 5321798654141050 },
  // { id: 5388021067081511 },
  // { id: 5392828158462405 },
  // { id: 5761490615168510 },
  // { id: 419785695857473 },
  // { id: 5754923033166049 },
  // { id: 6864386057523862 },
  // { id: 5991021003187976 },
  // { id: 7038879180279229 },
  // { id: 7203969359502821 },
  // { id: 7366624065249523 },
  // { id: 7501645377424303 },
  //     ])
  //   );
  // }, []);

  const onUploadSuccess = React.useCallback(
    (file) => {
      dispatch(addUploadedFile(file));
      dispatch(
        updateLinkedAssets({
          fileId: file.id.toString(),
          assetIds: file.assetIds,
        })
      );
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
