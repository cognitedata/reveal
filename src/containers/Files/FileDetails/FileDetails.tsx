import React from 'react';
import { FileInfo } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  AssetsItem,
  Label,
} from 'components';

export const FileDetails = ({ file }: { file: FileInfo }) => (
  <DetailsTabGrid>
    <DetailsTabItem name="Name" value={file.name} copyable />
    <DetailsTabItem name="ID" value={file.id} copyable />
    <DetailsTabItem name="External ID" value={file.externalId} copyable />
    <DetailsTabItem name="Source" value={file.source} />
    <DetailsTabItem name="MIME type" value={file.mimeType} />
    <DataSetItem id={file.id} type="file" />
    <AssetsItem assetIds={file.assetIds} linkId={file.id} type="file" />
    <DetailsTabItem
      name="Labels"
      value={
        file.labels
          ? file.labels.map(label => <Label>{label.externalId}</Label>)
          : undefined
      }
    />
    <DetailsTabItem
      name="Uploaded at"
      value={file ? <TimeDisplay value={file.uploadedTime} /> : 'Loading...'}
    />
  </DetailsTabGrid>
);
