import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import isEqual from 'lodash/isEqual';

import { FileInfo } from '@cognite/sdk';

import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { updateFileInfoField } from '../../../../store/thunks/Files/updateFileInfoField';
import { FileDetailsContainer } from '../../Components/FileMetadata/FileDetailsContainer';
import { MetaDataTable } from '../../Components/FileMetadata/MetadataTable';
import { MetadataTableToolBar } from '../../Components/FileMetadata/MetadataTableToolBar';
import { VisionFileDetailKey } from '../../Components/FileMetadata/Types';
import {
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from '../../selectors';
import { fileInfoEdit } from '../../slice';

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
  const dispatch = useThunkDispatch();

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
          title="Custom metadata"
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
