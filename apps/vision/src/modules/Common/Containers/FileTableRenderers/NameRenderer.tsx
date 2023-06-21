import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import ImageIcon from '@vision/assets/ImageIcon';
import ImageWithAnnotationsAndExifIcon from '@vision/assets/ImageWithAnnotationsAndExifIcon';
import ImageWithAnnotationsIcon from '@vision/assets/ImageWithAnnotationsIcon';
import ImageWithExifIcon from '@vision/assets/ImageWithExifIcon';
import VideoIcon from '@vision/assets/VideoIcon';
import VideoWithExifIcon from '@vision/assets/VideoWithExifIcon';
import { isVideo } from '@vision/modules/Common/Components/FileUploader/utils/FileUtils';
import { makeSelectFileAnnotations } from '@vision/modules/Common/store/annotation/selectors';
import { CellRenderer } from '@vision/modules/Common/types';
import { RootState } from '@vision/store/rootReducer';

import { Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

export const FileNameText = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 1 auto;
  display: inline-block;
  margin-left: 10px;
`;

export const FileRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: inherit;
  width: inherit;
  align-items: center;
`;

export const ExifIcon = styled.div`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0;
  padding-left: 0;
  flex: 0 0 auto;
`;

export function NameRenderer({
  rowData: { name, id, mimeType, geoLocation },
}: CellRenderer) {
  const selectFileAnnotations = useMemo(makeSelectFileAnnotations, []);
  const hasAnnotations = useSelector(
    ({ annotationReducer }: RootState) =>
      !!selectFileAnnotations(annotationReducer, id).length
  );

  const renderIcon = () => {
    const isVideoFile = isVideo({ mimeType } as FileInfo);
    let icon;

    if (hasAnnotations) {
      icon = geoLocation ? (
        <Tooltip content="Geolocated">
          <ExifIcon>
            <ImageWithAnnotationsAndExifIcon />
          </ExifIcon>
        </Tooltip>
      ) : (
        <ImageWithAnnotationsIcon />
      );
    } else if (isVideoFile) {
      icon = geoLocation ? (
        <Tooltip content="Geolocated">
          <ExifIcon>
            <VideoWithExifIcon />
          </ExifIcon>
        </Tooltip>
      ) : (
        <VideoIcon />
      );
    } else {
      icon = geoLocation ? (
        <Tooltip content="Geolocated">
          <ExifIcon>
            <ImageWithExifIcon />
          </ExifIcon>
        </Tooltip>
      ) : (
        <ImageIcon />
      );
    }

    return icon;
  };
  return (
    <FileRow>
      {renderIcon()}
      <FileNameText>{name}</FileNameText>
    </FileRow>
  );
}
