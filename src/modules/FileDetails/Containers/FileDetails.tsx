import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { FileDetailsContainer } from 'src/modules/FileDetails/Components/FileMetadata/FileDetailsContainer';
import { MetadataTableToolBar } from 'src/modules/FileDetails/Components/FileMetadata/MetadataTableToolBar';
import { MetaDataTable } from 'src/modules/FileDetails/Components/FileMetadata/MetadataTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import isEqual from 'lodash-es/isEqual';
import { VisionFileDetails } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { updateFileInfoField } from 'src/store/thunks/Files/updateFileInfoField';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFileV1 } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFileV1';
import styled from 'styled-components';
import {
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from 'src/modules/FileDetails/selectors';
import { fileInfoEdit } from 'src/modules/FileDetails/slice';
import { Tabs } from '@cognite/data-exploration';
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
  const dispatch = useDispatch();

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

  const onAnnotationDeleteClick = (annotationId: number) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFileV1({
        annotationIds: [annotationId],
        showWarnings: true,
      })
    );
  };

  return (
    <Container>
      <CloseButtonRow>
        <CloseButton
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
          <Tabs
            tab="context"
            onTabChange={() => {}}
            style={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '20px',
              paddingBottom: '13px',
              border: 0,
            }}
          >
            <Tabs.Pane
              title="Annotations"
              key="context"
              style={{ overflow: 'hidden' }}
            >
              {fileDetails?.id && (
                <FileDetailsAnnotationsPreview
                  fileInfo={fileDetails}
                  onReviewClick={onReview}
                  onAnnotationDeleteClick={onAnnotationDeleteClick}
                />
              )}
            </Tabs.Pane>
            <Tabs.Pane
              title="File Details"
              key="file-details"
              style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
            >
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
                columnWidth={180}
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
            </Tabs.Pane>
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
  padding: 10px 20px;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 32px auto;
`;

const TitleRow = styled.div`
  display: flex;
  text-overflow: ellipsis !important;
  white-space: nowrap;
  overflow: hidden;
`;

const DetailsContainer = styled.div`
  width: 100%;
  padding: 15px 0;
`;

const CloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled(Button)`
  color: black;
`;
