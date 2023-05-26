import React from 'react';

import { TimeDisplay, GeneralDetails } from '@data-exploration/components';

import { FileInfo as FileInfoProps } from '@cognite/sdk';

export const FileInfo = ({ file }: { file: FileInfoProps }) => (
  <GeneralDetails>
    <GeneralDetails.Item
      key={file.name}
      name="Name"
      value={file.name}
      copyable
    />
    <GeneralDetails.Item
      key={file.directory}
      name="Directory"
      value={file.directory}
      copyable
    />
    <GeneralDetails.Item key={file.id} name="ID" value={file.id} copyable />
    <GeneralDetails.Item
      key={file.externalId}
      name="External ID"
      value={file.externalId}
      copyable
    />
    <GeneralDetails.Item name="Source" value={file.source} />
    <GeneralDetails.Item name="MIME type" value={file.mimeType} />
    <GeneralDetails.DataSetItem id={file.id} type="file" />
    <GeneralDetails.AssetsItem
      assetIds={file.assetIds}
      linkId={file.id}
      type="file"
    />
    <GeneralDetails.LabelsItem
      labels={file.labels?.map((label) => label.externalId)}
    />
    <GeneralDetails.Item
      name="Uploaded at"
      value={<TimeDisplay value={file.uploadedTime} />}
    />
  </GeneralDetails>
);
