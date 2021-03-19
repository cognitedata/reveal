import { dateformat } from 'src/utils/DateUtils';
import React from 'react';
import styled from 'styled-components';
import {
  DataSetFieldView,
  FileDetailFieldView,
  LabelContainerView,
} from 'src/components/FileMetadata/FileMetaDataChildren';
import { VisionFileDetails } from 'src/components/FileMetadata/Types';

export const FileMetadataFieldsContainer = (props: {
  info: VisionFileDetails;
  updateInfo: (key: string) => void;
  onFieldChange: (key: string, value: any) => void;
}) => {
  const { info, updateInfo, onFieldChange } = props;
  return (
    <DetailsFormContainer>
      <FileDetailFieldView
        id="name"
        title="File name"
        placeholder="None Set"
        value={info.name}
      />
      <FileDetailFieldView
        id="id"
        title="ID"
        placeholder="None Set"
        value={info.id}
        copyable
      />
      <FileDetailFieldView
        id="externalId"
        title="External ID"
        placeholder="None Set"
        value={info.externalId}
        copyable
        editable
        onBlur={updateInfo}
        onInput={onFieldChange}
      />
      <LabelContainerView
        value={info.labels}
        setValue={(value) => {
          onFieldChange('labels', value);
          updateInfo('labels');
        }}
      />

      <FileDetailFieldView
        id="source"
        title="Source"
        placeholder="None Set"
        value={info.source}
        editable
        onBlur={updateInfo}
        onInput={onFieldChange}
      />
      {info.mimeType && (
        <FileDetailFieldView
          id="mimeType"
          title="MIME type"
          placeholder="None Set"
          value={info.mimeType}
          editable
          onBlur={updateInfo}
          onInput={onFieldChange}
        />
      )}
      {info.geoLocation && (
        <FileDetailFieldView
          id="geoLocation"
          title="Geolocation (lon, lat)"
          placeholder="None Set"
          value={info.geoLocation?.geometry.coordinates.join(', ')}
          copyable
        />
      )}
      <DataSetFieldView fileId={info.id} />

      <FieldRow>
        {info.uploaded && info.uploadedTime && (
          <FieldItem>
            <FileDetailFieldView
              id="uploadedTime"
              title="Uploaded at"
              value={dateformat(info.uploadedTime)}
            />
          </FieldItem>
        )}
        <FieldItem>
          <FileDetailFieldView
            id="createdTime"
            title="Created at"
            value={dateformat(info.createdTime)}
          />
        </FieldItem>
        <FieldItem>
          <FileDetailFieldView
            id="lastUpdatedTime"
            title="Updated at"
            value={dateformat(info.lastUpdatedTime)}
          />
        </FieldItem>
      </FieldRow>
    </DetailsFormContainer>
  );
};

const DetailsFormContainer = styled.div`
  width: 100%;
`;

const FieldRow = styled.div`
  display: flex;
  width: 100%;
  grid-auto-flow: row;
  flex-wrap: wrap;
`;

const FieldItem = styled.div`
  width: 145px;
  margin-right: 40px;
`;
