import React, { useMemo, useRef } from 'react';
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
import { DataSetItem } from '@cognite/data-exploration';
import { dateformat } from 'src/utils/DateUtils';
import { generateKeyValueArray } from 'src/utils/FormatUtils';
import {
  FileDetailFieldView,
  LabelContainerView,
} from 'src/pages/Preview/components/FileDetails/FileDetailEditChildren';
import { updateFileById } from 'src/store/uploadedFilesSlice';
import isEqual from 'lodash-es/isEqual';

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
  const detailContainer = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();

  const editedFileInfo = useSelector(
    ({ previewSlice }: RootState) => previewSlice.fileDetails
  );

  const editedFileMeta = useSelector(
    ({ previewSlice }: RootState) => previewSlice.fileMetaData
  );

  const fileInfo = useMemo(() => {
    const mergedInfo: v3.FileInfo = {
      ...fileObj,
      ...editedFileInfo,
    };

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
  }, [editedFileInfo, editedFileMeta]);

  const tableEditMode = useSelector(
    ({ previewSlice }: RootState) => previewSlice.metadataEdit
  );

  const handleEditModeChange = () => {
    dispatch(toggleMetaDataTableEditMode(fileInfo.metadata));
    if (tableEditMode) {
      updateFileInfo('metadata');
    }
  };

  const handleAddMetadataRow = () => {
    setTimeout(() => {
      if (detailContainer.current) {
        // scroll container to bottom
        detailContainer.current.scrollTop =
          detailContainer.current.scrollHeight;
      }
    }, 100);
    dispatch(fileMetaDataAddRow(fileInfo.metadata));
  };

  const updateFileInfo = (key: string) => {
    dispatch(updateFileById({ fileId: fileInfo.id, key }));
  };

  const onInput = (key: string, value: any) => {
    if (!isEqual(fileInfo[key as keyof v3.FileInfo], value)) {
      dispatch(fileInfoEdit({ key, value }));
    }
  };

  return (
    <Container>
      <TitleRow>
        <Title level={3}>File Details</Title>
      </TitleRow>
      <DetailsContainer ref={detailContainer}>
        <DetailsFormContainer>
          <FileDetailFieldView
            id="name"
            title="File name"
            placeholder="None Set"
            value={fileInfo.name}
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
            onBlur={updateFileInfo}
            onInput={onInput}
          />
          <LabelContainerView
            value={fileInfo.labels}
            setValue={(value) => {
              onInput('labels', value);
              updateFileInfo('labels');
            }}
          />

          <FileDetailFieldView
            id="source"
            title="Source"
            placeholder="None Set"
            value={fileInfo.source}
            editable
            onBlur={updateFileInfo}
            onInput={onInput}
          />
          {fileObj.mimeType && (
            <FileDetailFieldView
              id="mimeType"
              title="MIME type"
              placeholder="None Set"
              value={fileInfo.mimeType}
            />
          )}
          {fileInfo.geoLocation && (
            <FileDetailFieldView
              id="geoLocation"
              title="Geolocation (lon/lat)"
              placeholder="None Set"
              value={fileInfo.geoLocation?.geometry.coordinates.join(', ')}
              copyable
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
