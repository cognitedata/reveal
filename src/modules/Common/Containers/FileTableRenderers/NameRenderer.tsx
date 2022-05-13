import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { CellRenderer } from 'src/modules/Common/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Tooltip } from '@cognite/cogs.js';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import ImageIcon from 'src/assets/ImageIcon.svg';
import ImageWithExifIcon from 'src/assets/ImageWithExifIcon.svg';
import VideoIcon from 'src/assets/VideoIcon.svg';
import VideoWithExifIcon from 'src/assets/VideoWithExifIcon.svg';
import ImageWithAnnotationsIcon from 'src/assets/ImageWithAnnotationsIcon.svg';
import ImageWithAnnotationsAndExifIcon from 'src/assets/ImageWithAnnotationsAndExifIcon.svg';
import { FileInfo } from '@cognite/sdk';
import { makeSelectFileAnnotations } from 'src/modules/Common/store/annotation/selectors';

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
            <img
              src={ImageWithAnnotationsAndExifIcon}
              alt="ImageWithAnnotationsAndExifIcon"
            />
          </ExifIcon>
        </Tooltip>
      ) : (
        <img src={ImageWithAnnotationsIcon} alt="ImageWithAnnotationsIcon" />
      );
    } else if (isVideoFile) {
      icon = geoLocation ? (
        <Tooltip content="Geolocated">
          <ExifIcon>
            <img src={VideoWithExifIcon} alt="VideoWithExifIcon" />
          </ExifIcon>
        </Tooltip>
      ) : (
        <img src={VideoIcon} alt="VideoIcon" />
      );
    } else {
      icon = geoLocation ? (
        <Tooltip content="Geolocated">
          <ExifIcon>
            <img src={ImageWithExifIcon} alt="ImageWithExifIcon" />
          </ExifIcon>
        </Tooltip>
      ) : (
        <img src={ImageIcon} alt="ImageIcon" />
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
