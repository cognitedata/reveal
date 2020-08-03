import React from 'react';
import { FilesMetadata } from '@cognite/sdk';
import { InfoGrid, DetailsItem } from 'components/Common';
import moment from 'moment';

export const FileInfoGrid = ({ file }: { file: FilesMetadata }) => {
  return (
    <InfoGrid noBorders>
      <DetailsItem name="Source" value={file.source} />
      <DetailsItem name="MimeType" value={file.mimeType} />
      <DetailsItem
        name="Uploaded at"
        value={
          file.uploadedTime
            ? moment(file.uploadedTime).format('MM/DD/YYYY HH:MM')
            : 'undefined'
        }
      />
      <DetailsItem
        name="Created at"
        value={moment(file.createdTime).format('MM/DD/YYYY HH:MM')}
      />
      <DetailsItem
        name="Updated at"
        value={moment(file.lastUpdatedTime).format('MM/DD/YYYY HH:MM')}
      />
    </InfoGrid>
  );
};
