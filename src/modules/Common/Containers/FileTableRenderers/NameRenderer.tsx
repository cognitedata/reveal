import { CellRenderer } from 'src/modules/Common/Types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectUpdatedFileDetails } from 'src/modules/FileMetaData/fileMetadataSlice';
import { Tooltip } from '@cognite/cogs.js';
import exifIcon from 'src/assets/exifIcon.svg';
import React from 'react';
import {
  ExifIcon,
  FileNameText,
  FileRow,
} from 'src/modules/Common/Components/FileTable/FileTable';

export function NameRenderer({ rowData: { name, id } }: CellRenderer) {
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(id))
  );
  return (
    <FileRow>
      <FileNameText>{name}</FileNameText>
      {fileDetails?.geoLocation && (
        <Tooltip content="EXIF data added">
          <ExifIcon>
            <img src={exifIcon} alt="exifIcon" />
          </ExifIcon>
        </Tooltip>
      )}
    </FileRow>
  );
}
