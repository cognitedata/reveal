import React from 'react';

import { TimeDisplay, GeneralDetails } from '@data-exploration/components';

import { FileInfo as FileInfoProps } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';

export const FileInfo = ({ file }: { file: FileInfoProps }) => {
  const { t } = useTranslation();

  return (
    <GeneralDetails>
      <GeneralDetails.Item
        key={file.name}
        name={t('NAME', 'Name')}
        value={file.name}
        copyable
      />
      <GeneralDetails.Item
        key={file.directory}
        name={t('DIRECTORY', 'Directory')}
        value={file.directory}
        copyable
      />
      <GeneralDetails.Item
        key={file.id}
        name={t('ID', 'ID')}
        value={file.id}
        copyable
      />
      <GeneralDetails.Item
        key={file.externalId}
        name={t('EXTERNAL_ID', 'External ID')}
        value={file.externalId}
        copyable
      />
      <GeneralDetails.Item name={t('SOURCE', 'Source')} value={file.source} />
      <GeneralDetails.Item
        name={t('MIME_TYPE', 'MIME type')}
        value={file.mimeType}
      />
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
        name={t('UPLOADED_AT', 'Uploaded at')}
        value={<TimeDisplay value={file.uploadedTime} />}
      />
    </GeneralDetails>
  );
};
