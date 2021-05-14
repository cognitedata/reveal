import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { Body, DocumentIcon } from '@cognite/cogs.js';
import { Loader, useFileIcon } from '@cognite/data-exploration';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isFilePreviewable } from '../FileUploader/utils/FileUtils';

interface ThumbnailProps {
  fileInfo: FileInfo;
}

export const Thumbnail = ({ fileInfo }: ThumbnailProps) => {
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError } = useFileIcon(fileInfo);

  const isPreviewable = isFilePreviewable(fileInfo);
  useEffect(() => {
    if (data) {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView]);
      setImage(URL.createObjectURL(blob));
    }
    return () => {
      setImage((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [data]);

  const image = useMemo(() => {
    if (isPreviewable) {
      if (imageUrl) {
        return <img src={imageUrl} alt="" />;
      }
      if (!isError) {
        return <Loader />;
      }
    }
    return (
      <Container>
        <DocumentIcon file={fileInfo.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>Unable to preview file.</Body>}
      </Container>
    );
  }, [imageUrl, isPreviewable, fileInfo, isError]);

  return image;
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  display: inline-flex;
  justify-content: center;
`;
