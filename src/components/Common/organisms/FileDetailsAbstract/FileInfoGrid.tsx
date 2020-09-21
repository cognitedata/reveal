import React from 'react';
import { FileInfo } from 'cognite-sdk-v3';
import { InfoGrid, DetailsItem, TimeDisplay } from 'components/Common';

export const FileInfoGrid = ({ file }: { file: FileInfo }) => {
  return (
    <InfoGrid noBorders>
      <DetailsItem name="Source" value={file.source} />
      <DetailsItem name="MIME type" value={file.mimeType} />
      <DetailsItem
        name="Uploaded at"
        value={
          file.uploadedTime ? (
            <TimeDisplay value={file.uploadedTime} />
          ) : (
            'undefined'
          )
        }
      />
      <DetailsItem
        name="Created at"
        value={<TimeDisplay value={file.createdTime} />}
      />
      <DetailsItem
        name="Updated at"
        value={<TimeDisplay value={file.lastUpdatedTime} />}
      />
    </InfoGrid>
  );
};
