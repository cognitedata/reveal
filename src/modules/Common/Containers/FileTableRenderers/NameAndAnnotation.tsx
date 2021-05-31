import { CellRenderer } from 'src/modules/Common/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Tooltip } from '@cognite/cogs.js';
import exifIcon from 'src/assets/exifIcon.svg';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { makeSelectAnnotationStatuses } from 'src/modules/Process/processSlice';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { makeSelectAnnotationCounts } from '../../annotationSlice';
import { AnnotationsBadge } from '../../Components/AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../../Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { Popover } from '../../Components/Popover';

export function NameAndAnnotationRenderer({
  rowData: { name, id, geoLocation },
}: CellRenderer) {
  const dispatch = useDispatch();
  const selectAnnotationCounts = useMemo(makeSelectAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationCounts(annotationReducer, id)
  );

  const selectAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatus = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  useEffect(() => {
    dispatch(RetrieveAnnotations({ fileIds: [id], assetIds: undefined }));
  }, []);

  return (
    <Container>
      <FileRow>
        <Filename>{name}</Filename>
        {geoLocation && (
          <Tooltip content="Exif data added">
            <ExifIcon>
              <img src={exifIcon} alt="exifIcon" />
            </ExifIcon>
          </Tooltip>
        )}
      </FileRow>
      <Popover
        placement="bottom"
        trigger="mouseenter click"
        content={AnnotationsBadgePopoverContent(
          annotationCounts,
          annotationStatus
        )}
      >
        <>{AnnotationsBadge(annotationCounts, annotationStatus)}</>
      </Popover>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 6px;
`;

export const FileRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: inherit;
  width: inherit;
  align-items: center;
`;

const Filename = styled.div`
  display: flex;
  width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
`;

export const ExifIcon = styled.div`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0px;
  padding-left: 0px;
  flex: 0 0 auto;
`;
