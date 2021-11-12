/* eslint-disable @cognite/no-number-z-index */
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { Body, DocumentIcon, Button } from '@cognite/cogs.js';
import { Loader, useFileIcon } from '@cognite/data-exploration';
import React, { useEffect, useMemo, useState } from 'react';
import { isFilePreviewable } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import styled from 'styled-components';

interface ThumbnailProps {
  fileInfo: FileInfo;
  onViewClicked?: () => void;
}

export const Thumbnail = ({ fileInfo, onViewClicked }: ThumbnailProps) => {
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

  const iconOverlay = () => {
    return (
      <OverlayContainer className="overlay">
        <Button
          type="tertiary"
          variant="inverted"
          onClick={onViewClicked}
          style={{ padding: '4px 60px' }}
        >
          View
        </Button>
      </OverlayContainer>
    );
  };

  const image = useMemo(() => {
    if (isPreviewable) {
      if (imageUrl) {
        return (
          <>
            <img src={imageUrl} className="image" alt="" />
            {onViewClicked && iconOverlay()}
          </>
        );
      }
      if (!isError) {
        return <Loader />;
      }
    }
    return (
      <>
        <DocumentIcon file={fileInfo.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>Unable to preview file.</Body>}
        {onViewClicked && iconOverlay()}
      </>
    );
  }, [imageUrl, isPreviewable, fileInfo, isError]);

  return <Container>{image}</Container>;
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: inline-flex;

  overflow: hidden;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  transition: 0.5s ease;

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :hover {
    .overlay {
      opacity: 0.9;
      cursor: pointer;
    }
  }
`;

const OverlayContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  transition: 0.5s ease;
  background: #262626;
`;
