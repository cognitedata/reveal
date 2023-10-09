import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import isEqual from 'lodash/isEqual';

import { Button, Icon, Tabs, Title } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { updateFileInfoField } from '../../../store/thunks/Files/updateFileInfoField';
import { FileDetailsContainer } from '../Components/FileMetadata/FileDetailsContainer';
import { MetaDataTable } from '../Components/FileMetadata/MetadataTable';
import { MetadataTableToolBar } from '../Components/FileMetadata/MetadataTableToolBar';
import { VisionFileDetails } from '../Components/FileMetadata/Types';
import {
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from '../selectors';
import { fileInfoEdit } from '../slice';

import { FileDetailsAnnotationsPreview } from './FileDetailsAnnotationsPreview/FileDetailsAnnotationsPreview';

export const FileDetails = ({
  fileId,
  onClose,
  onReview,
}: {
  fileId: number;
  onClose: () => void;
  onReview: () => void;
}) => {
  const dispatch = useThunkDispatch();

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, fileId)
  );

  const tableEditMode = useSelector(
    ({ fileDetailsSlice: fileMetadataSlice }: RootState) =>
      metadataEditMode(fileMetadataSlice)
  );

  const fileMetadata = useSelector((state: RootState) =>
    selectUpdatedFileMeta(state, fileId)
  );

  if (!fileId) {
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const onFieldChange = (key: string, value: any) => {
    if (
      fileDetails &&
      !isEqual(fileDetails[key as keyof VisionFileDetails], value)
    ) {
      dispatch(fileInfoEdit({ key, value }));
    }
  };

  const updateFileInfo = (key: string) => {
    dispatch(updateFileInfoField({ fileId, key }));
  };

  const onEditModeChange = (mode: boolean) => {
    if (mode) {
      updateFileInfo('metadata');
    }
  };

  if (!fileDetails) {
    return (
      <IconContainer>
        <Icon type="Loader" />
      </IconContainer>
    );
  }

  return (
    <Container>
      <CloseButtonRow>
        <Button
          icon="Close"
          type="ghost"
          onClick={handleClose}
          aria-label="close button"
        />
      </CloseButtonRow>
      <Content>
        <TitleRow>
          <Title level={4} style={{ color: '#4A67FB' }}>
            {fileDetails?.name}
          </Title>
        </TitleRow>
        <DetailsContainer>
          <Tabs>
            <Tabs.Tab tabKey="1" label="Annotations">
              <FileDetailsContent>
                <FileDetailsAnnotationsPreview
                  fileInfo={fileDetails}
                  onReviewClick={onReview}
                />
              </FileDetailsContent>
            </Tabs.Tab>
            <Tabs.Tab tabKey="2" label="File Details">
              <FileDetailsContent>
                <FileDetailsContainer
                  info={fileDetails}
                  onFieldChange={onFieldChange}
                  updateInfo={updateFileInfo}
                />
                <MetaDataTable
                  title="Custom metadata"
                  rowHeight={35}
                  columnWidth={170}
                  editMode={tableEditMode}
                  data={fileMetadata}
                  details={fileDetails}
                  toolBar={
                    <MetadataTableToolBar
                      editMode={tableEditMode}
                      metadata={fileMetadata}
                      onEditModeChange={onEditModeChange}
                    />
                  }
                />
              </FileDetailsContent>
            </Tabs.Tab>
          </Tabs>
        </DetailsContainer>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40px auto;
  background: white;
`;

const Content = styled.div`
  padding-left: 20px;
  padding-right: 10px;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 32px auto;
  grid-row-gap: 15px;
  overflow: hidden;
`;

const FileDetailsContent = styled.div`
  height: calc(100vh - 230px);
  width: 100%;
  padding-right: 10px;
  padding-left: 2px;
  padding-bottom: 10px;
  overflow-y: auto;
`;

const TitleRow = styled.div`
  display: flex;
  text-overflow: ellipsis !important;
  white-space: nowrap;
  overflow: hidden;
  align-items: center;
`;

const DetailsContainer = styled.div`
  width: 100%;
  overflow: hidden;
`;

const CloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const IconContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
