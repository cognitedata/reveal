import React from 'react';
import { Title, Button } from '@cognite/cogs.js';
import { v3 } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import {
  MetadataItem,
  MetaDataTable,
} from 'src/pages/Preview/components/MetaDataTable/MetadataTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  fileInfoEdit,
  fileMetaDataAddRow,
  toggleMetaDataTableEditMode,
} from 'src/store/previewSlice';
import { DataSetItem, LabelFilter } from '@cognite/data-exploration';
import { dateformat } from 'src/utils/DateUtils';
import { generateKeyValueArray } from 'src/utils/FormatUtils';
import { FileDetailFieldView } from 'src/pages/Preview/components/FileDetails/FileDetailEditChildren';

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
`;

const DetailsFormContainer = styled.div`
  width: 100%;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 145px 145px 145px;
  grid-column-gap: 40px;
`;

const TableToolBar = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
`;

const StyledButton = styled(Button)`
  margin-left: 15px;
`;

type FileDetailCompProps = { fileObj: v3.FileInfo };

export const FileDetailEdit: React.FC<FileDetailCompProps> = ({
  fileObj,
}: FileDetailCompProps) => {
  const dispatch = useDispatch();

  const fileInfo = useSelector(({ previewSlice }: RootState) => {
    const editedFileInfo = previewSlice.fileDetails;
    const mergedInfo: v3.FileInfo = {
      ...fileObj,
      ...editedFileInfo,
    };

    const editedFileMeta = previewSlice.fileMetaData;
    let metadata: MetadataItem[];
    if (Object.keys(editedFileMeta).length > 0) {
      metadata = Object.values(editedFileMeta);
    } else {
      metadata = generateKeyValueArray(mergedInfo.metadata);
    }
    const info: Omit<v3.FileInfo, 'metadata'> & { metadata: MetadataItem[] } = {
      ...mergedInfo,
      metadata,
    };
    return info;
  });

  const tableEditMode = useSelector(
    ({ previewSlice }: RootState) => previewSlice.metadataEdit
  );

  const handleEditModeChange = () => {
    dispatch(toggleMetaDataTableEditMode(fileInfo.metadata));
  };

  const handleAddMetadataRow = () => {
    dispatch(fileMetaDataAddRow(fileInfo.metadata));
  };

  return (
    <Container>
      <TitleRow>
        <Title level={3}>File Details</Title>
      </TitleRow>
      <DetailsContainer>
        <DetailsFormContainer>
          <FileDetailFieldView
            id="name"
            title="File name"
            placeholder="None Set"
            value={fileInfo.name}
            editable
          />
          <FileDetailFieldView
            id="id"
            title="ID"
            placeholder="None Set"
            value={fileInfo.id}
            copyable
          />
          <FileDetailFieldView
            id="externalId"
            title="External ID"
            placeholder="None Set"
            value={fileInfo.externalId}
            copyable
            editable
          />
          <LabelFieldContainer>
            <LabelFilter
              resourceType="asset"
              value={fileInfo.labels}
              setValue={(value) => {
                dispatch(fileInfoEdit({ key: 'labels', value }));
              }}
            />
          </LabelFieldContainer>

          <FileDetailFieldView
            id="source"
            title="Source"
            placeholder="None Set"
            value={fileInfo.source}
            editable
          />
          {fileObj.mimeType && (
            <FileDetailFieldView
              id="mimeType"
              title="MIME type"
              placeholder="None Set"
              value={fileInfo.mimeType}
            />
          )}
          <DataSetFieldContainer>
            <DataSetItem id={fileInfo.id} type="file" />
          </DataSetFieldContainer>

          <FieldRow>
            {fileInfo.uploaded && fileInfo.uploadedTime && (
              <FileDetailFieldView
                id="uploadedTime"
                title="Uploaded at"
                value={dateformat(fileInfo.uploadedTime)}
              />
            )}
            <FileDetailFieldView
              id="createdTime"
              title="Created at"
              value={dateformat(fileInfo.createdTime)}
            />
            <FileDetailFieldView
              id="lastUpdatedTime"
              title="Updated at"
              value={dateformat(fileInfo.lastUpdatedTime)}
            />
          </FieldRow>
        </DetailsFormContainer>
        <TableToolBar>
          <StyledButton
            type="secondary"
            icon="Plus"
            onClick={handleAddMetadataRow}
          >
            Add row
          </StyledButton>
          <StyledButton
            type="primary"
            disabled={!fileInfo.metadata.length}
            icon={tableEditMode ? 'Checkmark' : 'Edit'}
            onClick={handleEditModeChange}
          >
            {tableEditMode ? 'Finish Editing' : 'Edit table'}
          </StyledButton>
        </TableToolBar>
        <MetaDataTable
          title="MetaData"
          rowHeight={35}
          editMode={tableEditMode}
          data={fileInfo.metadata}
        />
      </DetailsContainer>
    </Container>
  );
};

const LabelFieldContainer = styled.div`
  width: 450px;
  margin-bottom: 14px;

  & div.title:first-child {
    color: var(--cogs-b2-color);
    font-size: var(--cogs-b2-font-size);
    font-weight: 500;
    line-height: var(--cogs-b2-line-height);
    letter-spacing: var(--cogs-b2-letter-spacing);
    margin-top: 0 !important;
    margin-bottom: 4px !important;
  }
`;
const DataSetFieldContainer = styled.div`
  margin-bottom: 14px;

  & div > div {
    color: var(--cogs-b2-color);
    font-size: var(--cogs-b2-font-size);
    font-weight: 500;
    line-height: var(--cogs-b2-line-height);
    letter-spacing: var(--cogs-b2-letter-spacing);
    margin-top: 0 !important;
    margin-bottom: 4px !important;
  }

  & a {
    font-size: 14px;
    margin-left: 12px;
  }
`;
