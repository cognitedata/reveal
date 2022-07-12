import React from 'react';
import { useFilePreviewURL } from 'hooks/sdk';
import { Body, DocumentIcon } from '@cognite/cogs.js';
import { Loader } from 'components';
import { FileInfo } from '@cognite/sdk';

export const FileThumbnail = ({ file }: { file: FileInfo }) => {
  const { data: filePreviewUrl, isError, isFetching } = useFilePreviewURL(file);

  if (filePreviewUrl) {
    return <img src={filePreviewUrl} height="200px" alt="" />;
  }
  if (!isError && isFetching) {
    return <Loader />;
  }
  return (
    <>
      <DocumentIcon file={file.name} style={{ height: 36, width: 36 }} />
      {isError && <Body level={3}>Unable to preview file.</Body>}
    </>
  );
};
