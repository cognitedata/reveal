import React, { useRef } from 'react';
import { updateFileInfoField } from 'src/store/thunks/Files/updateFileInfoField';
import styled from 'styled-components';
import { MetaDataTable } from 'src/modules/FileDetails/Components/FileMetadata/MetadataTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import isEqual from 'lodash-es/isEqual';
import { FileDetailsContainer } from 'src/modules/FileDetails/Components/FileMetadata/FileDetailsContainer';
import { MetadataTableToolBar } from 'src/modules/FileDetails/Components/FileMetadata/MetadataTableToolBar';
import { FileInfo } from '@cognite/sdk';
import { VisionFileDetailKey } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import {
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from 'src/modules/FileDetails/selectors';
import { fileInfoEdit } from 'src/modules/FileDetails/slice';

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 15px;
  overflow-y: auto;
`;

const DetailsContainer = styled.div`
  width: 100%;
  padding-right: 10px;
  overflow-y: auto;
  padding-left: 2px;
  padding-bottom: 10px;
`;

type FileDetailCompProps = { fileObj: FileInfo };

export const FileDetailsReview: React.FC<FileDetailCompProps> = ({
  fileObj,
}: FileDetailCompProps) => {
  const detailContainer = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, fileObj.id)
  );

  const tableEditMode = useSelector(
    ({ fileDetailsSlice: fileMetadataSlice }: RootState) =>
      metadataEditMode(fileMetadataSlice)
  );

  const fileMetadata = useSelector((state: RootState) =>
    selectUpdatedFileMeta(state, fileObj.id)
  );

  const onFieldChange = (key: VisionFileDetailKey, value: any) => {
    if (fileDetails) {
      if (!isEqual(fileDetails[key], value)) {
        dispatch(fileInfoEdit({ key, value }));
      }
    }
  };

  const updateFileInfo = (key: string) => {
    dispatch(updateFileInfoField({ fileId: fileObj.id, key }));
  };

  const onEditModeChange = (mode: boolean) => {
    if (mode) {
      updateFileInfo('metadata');
    }
  };

  const onAddRow = () => {
    setTimeout(() => {
      if (detailContainer.current) {
        // scroll container to bottom
        detailContainer.current.scrollTop =
          detailContainer.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Container>
      <DetailsContainer ref={detailContainer}>
        {fileDetails && (
          <FileDetailsContainer
            info={fileDetails}
            onFieldChange={onFieldChange}
            updateInfo={updateFileInfo}
          />
        )}
        <MetaDataTable
          title="Metadata"
          rowHeight={35}
          editMode={tableEditMode}
          data={fileMetadata}
          columnWidth={200}
          details={fileDetails}
          toolBar={
            <MetadataTableToolBar
              editMode={tableEditMode}
              metadata={fileMetadata}
              onAddRow={onAddRow}
              onEditModeChange={onEditModeChange}
            />
          }
        />
      </DetailsContainer>
    </Container>
  );
};
