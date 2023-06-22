import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import ExifIcon from '@vision/assets/exifIcon';
import { AnnotationsBadgePopover } from '@vision/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';
import { makeSelectTotalAnnotationCountForFileIds } from '@vision/modules/Common/store/annotation/selectors';
import { CellRenderer } from '@vision/modules/Common/types';
import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { RootState } from '@vision/store/rootReducer';

import { Tooltip } from '@cognite/cogs.js';

export function NameAndAnnotationRenderer({
  rowData: { name, id, geoLocation },
}: CellRenderer) {
  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationReducer, [id])
  );

  const selectAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    selectAnnotationStatuses(processSlice, id)
  );

  return (
    <Container>
      <FileRow>
        <Filename>{name}</Filename>
        {geoLocation && (
          <Tooltip content="Geolocated">
            <StyledExifIcon />
          </Tooltip>
        )}
      </FileRow>
      <AnnotationsBadgeContainer>
        {AnnotationsBadgePopover(annotationCounts, annotationStatuses)}
      </AnnotationsBadgeContainer>
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

const AnnotationsBadgeContainer = styled.div`
  display: flex;
`;

const Filename = styled.div`
  width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
`;

export const StyledExifIcon = styled(ExifIcon)`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0;
  padding-left: 0;
  flex: 0 0 auto;
`;
