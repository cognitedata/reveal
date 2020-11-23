import React from 'react';
import { FileInfo, DataSet } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  Label,
} from 'lib/components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

export const FileDetails = ({
  file,
  datasetLink,
}: {
  file: FileInfo;
  datasetLink?: string;
}) => {
  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: file?.dataSetId || 0 },
    { enabled: !!file && !!file?.dataSetId }
  );

  return (
    <DetailsTabGrid>
      <DetailsTabItem name="External ID" value={file.externalId} copyable />
      <DetailsTabItem name="ID" value={file.id} copyable />
      <DetailsTabItem name="Source" value={file.source} />
      <DetailsTabItem name="MIME type" value={file.mimeType} />
      <DetailsTabItem
        name="Data set"
        value={dataset?.name}
        link={datasetLink}
      />
      <DetailsTabItem
        name="Uploaded at"
        value={file ? <TimeDisplay value={file.uploadedTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="Created at"
        value={file ? <TimeDisplay value={file.createdTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="Updated at"
        value={
          file ? <TimeDisplay value={file.lastUpdatedTime} /> : 'Loading...'
        }
      />
      <DetailsTabItem
        name="Labels"
        value={
          file.labels
            ? file.labels.map(label => <Label>{label.externalId}</Label>)
            : undefined
        }
      />
    </DetailsTabGrid>
  );
};
