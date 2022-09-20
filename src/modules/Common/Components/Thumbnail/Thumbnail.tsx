/* eslint-disable @cognite/no-number-z-index */
import { FileInfo } from '@cognite/sdk';
import { Body, DocumentIcon, Button, Icon } from '@cognite/cogs.js';
import { Loader, useFileIcon } from '@cognite/data-exploration';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isFilePreviewable } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import styled from 'styled-components';
import { ThumbnailProcessingOverlay } from './ThumbnailProcessingOverlay';

export const Thumbnail = ({
  fileInfo,
  isFileProcessing,
  onViewClicked,
}: {
  fileInfo: FileInfo;
  isFileProcessing?: boolean;
  onViewClicked?: (evt: any) => void;
}) => {
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError, isLoading, error } = useFileIcon(fileInfo);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // reset previous image loading error if the icon is loading again - otherwise if error occurred image won't be shown again
  useEffect(() => {
    if (isLoading && imageLoadError) {
      setImageLoadError(false);
    }
  }, [isLoading, imageLoadError]);

  useEffect(() => {
    if (data && !imageLoadError) {
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
  }, [data, imageLoadError]);

  const iconOverlay = () => {
    return (
      <OverlayContainer className="overlay">
        <Button
          type="tertiary"
          variant="inverted"
          onClick={onViewClicked}
          style={{ padding: '4px 60px' }}
        >
          View file
          <Icon type="ArrowRight" style={{ marginLeft: '8px' }} />
        </Button>
      </OverlayContainer>
    );
  };

  const onImageLoadError = useCallback(() => {
    setImageLoadError(true);
  }, []);

  const thumbnailErrorMsg = useMemo(() => {
    if (!fileInfo.uploaded) {
      return 'File not Uploaded';
    }
    if ((error as { message?: string })?.message) {
      return (error as { message?: string }).message;
    }
    return 'Unable to preview file';
  }, [error, fileInfo.uploaded]);

  const image = useMemo(() => {
    const isPreviewable = isFilePreviewable(fileInfo);
    if (isPreviewable && !imageLoadError) {
      if (imageUrl) {
        return (
          <>
            <img
              src={imageUrl}
              className="image"
              alt=""
              onError={onImageLoadError}
            />
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
        {(isError || imageLoadError) && (
          <Body level={3}>{thumbnailErrorMsg}</Body>
        )}
        {onViewClicked && iconOverlay()}
      </>
    );
  }, [imageUrl, fileInfo, isError, imageLoadError]);

  return (
    <Container>
      {image}
      {isFileProcessing && <ThumbnailProcessingOverlay />}
    </Container>
  );
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
