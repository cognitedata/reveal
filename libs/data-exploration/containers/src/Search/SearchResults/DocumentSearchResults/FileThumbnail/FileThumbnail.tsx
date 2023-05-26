import React from 'react';

import Styled from 'styled-components';

import { Loader } from '@data-exploration/components';
import {
  InternalDocument,
  useFilePreviewURL,
} from '@data-exploration-lib/domain-layer';

import { Body, DocumentIcon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

export const FileThumbnail = ({
  file,
}: {
  file: FileInfo | InternalDocument;
}) => {
  const { data: filePreviewUrl, isError, isFetching } = useFilePreviewURL(file);

  if (filePreviewUrl) {
    return <ImagePreview src={filePreviewUrl} alt="" />;
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

const ImagePreview = Styled.img`
 max-height: 200px;
`;
