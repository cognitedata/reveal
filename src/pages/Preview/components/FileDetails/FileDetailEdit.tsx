import React, { useRef } from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { MetaDataTable } from 'src/components/FileMetadata/MetadataTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  fileInfoEdit,
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from 'src/store/uploadedFilesSlice';

import isEqual from 'lodash-es/isEqual';
import { FileMetadataFieldsContainer } from 'src/components/FileMetadata/FileMetadataFieldsContainer';
import { MetadataTableToolBar } from 'src/components/FileMetadata/MetadataTableToolBar';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { VisionFileDetailKey } from 'src/components/FileMetadata/Types';
import { updateFileInfoField } from 'src/store/thunks/updateFileInfoField';

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 15px;
  display: grid;
  grid-row-gap: 14px;
  grid-template-columns: 100%;
  grid-template-rows: auto calc(100% - 46px);
`;

const TitleRow = styled.div``;

const DetailsContainer = styled.div`
  width: 100%;
  padding-right: 10px;
  overflow-y: auto;
  padding-left: 2px;
  padding-bottom: 10px;
`;

type FileDetailCompProps = { fileObj: FileInfo };

export const FileDetailEdit: React.FC<FileDetailCompProps> = ({
  fileObj,
}: FileDetailCompProps) => {
  const detailContainer = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(fileObj.id))
  );

  const tableEditMode = useSelector(({ uploadedFiles }: RootState) =>
    metadataEditMode(uploadedFiles)
  );

  const fileMetadata = useSelector((state: RootState) =>
    selectUpdatedFileMeta(state, String(fileObj.id))
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
      <TitleRow>
        <Title level={3}>File Details</Title>
      </TitleRow>
      <DetailsContainer ref={detailContainer}>
        {fileDetails && (
          <FileMetadataFieldsContainer
            info={fileDetails}
            onFieldChange={onFieldChange}
            updateInfo={updateFileInfo}
          />
        )}
        <MetadataTableToolBar
          editMode={tableEditMode}
          metadata={fileMetadata}
          onAddRow={onAddRow}
          onEditModeChange={onEditModeChange}
        />
        <MetaDataTable
          title="Metadata"
          rowHeight={35}
          editMode={tableEditMode}
          data={fileMetadata}
          columnWidth={250}
          details={fileDetails}
        />
      </DetailsContainer>
    </Container>
  );
};
