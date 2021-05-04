import { dateformat } from 'src/utils/DateUtils';
import React from 'react';
import styled from 'styled-components';
import {
  DataSetFieldView,
  FileDetailFieldView,
  LabelContainerView,
} from 'src/modules/FileDetails/Components/FileMetadata/FileDetailsChildren';
import {
  VisionFileDetailKey,
  VisionFileDetails,
} from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { Title } from '@cognite/cogs.js';
import { InlineMapView } from '../../../Common/Components/MapView/InlineMapView';

export const FileDetailsContainer = (props: {
  info: VisionFileDetails;
  updateInfo: (key: VisionFileDetailKey) => void;
  onFieldChange: (key: VisionFileDetailKey, value: any) => void;
}) => {
  const { info, updateInfo, onFieldChange } = props;
  return (
    <DetailsFormContainer>
      <TitleContainer>
        <Title level={6}>Location Data</Title>
      </TitleContainer>
      {info.geoLocation && (
        <FileDetailFieldView
          id="geoLocation"
          title="Longitude, latitude: "
          placeholder="None Set"
          value={info.geoLocation?.geometry.coordinates.join(', ')}
          copyable
        />
      )}
      <InlineMapView geoLocation={info.geoLocation || undefined} />
      <TitleContainer>
        <Title level={6}>File Details</Title>
      </TitleContainer>

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

const TitleContainer = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
`;
