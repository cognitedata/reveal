import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { TimeDisplay, GeneralDetails } from 'components';

export const FileDetails = ({ file }: { file: FileInfo }) => (
  <GeneralDetails>
    <GeneralDetails.Item name="Name" value={file.name} copyable />
    <GeneralDetails.Item name="ID" value={file.id} copyable />
    <GeneralDetails.Item name="External ID" value={file.externalId} copyable />
    <GeneralDetails.Item name="Source" value={file.source} />
    <GeneralDetails.Item name="MIME type" value={file.mimeType} />
    <GeneralDetails.DataSetItem id={file.id} type="file" />
    <GeneralDetails.AssetsItem
      assetIds={file.assetIds}
      linkId={file.id}
      type="file"
    />
    <GeneralDetails.LabelsItem
      labels={file.labels?.map(label => label.externalId)}
    />
    <GeneralDetails.Item
      name="Uploaded at"
      value={<TimeDisplay value={file.uploadedTime} />}
    />
  </GeneralDetails>
);
