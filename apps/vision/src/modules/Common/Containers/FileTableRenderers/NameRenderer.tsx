import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import ImageIcon from '../../../../assets/ImageIcon';
import ImageWithAnnotationsAndExifIcon from '../../../../assets/ImageWithAnnotationsAndExifIcon';
import ImageWithAnnotationsIcon from '../../../../assets/ImageWithAnnotationsIcon';
import ImageWithExifIcon from '../../../../assets/ImageWithExifIcon';
import VideoIcon from '../../../../assets/VideoIcon';
import VideoWithExifIcon from '../../../../assets/VideoWithExifIcon';
import { RootState } from '../../../../store/rootReducer';
import { isVideo } from '../../Components/FileUploader/utils/FileUtils';
import { makeSelectFileAnnotations } from '../../store/annotation/selectors';
import { CellRenderer } from '../../types';

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
