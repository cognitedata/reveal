import React, { useMemo } from 'react';
import { makeSelectAnnotationsForFileIds } from 'src/modules/Common/store/annotationV1/selectors';
import { CellRenderer } from 'src/modules/Common/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Tag } from 'antd';
import styled from 'styled-components';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { Body } from '@cognite/cogs.js';

export const createTag = (status: string, count: number, color: string) => {
  return (
    <Tag color={color}>
      {status} x {count}
    </Tag>
  );
};

export function AnnotationStatusRenderer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationsForFileIds = useMemo(
    makeSelectAnnotationsForFileIds,
    []
  );
  const annotationsMap = useSelector(({ annotationV1Reducer }: RootState) =>
    selectAnnotationsForFileIds(annotationV1Reducer, [id])
  );

  const rejectedAnnotationIds: number[] = [];
  const acceptedAnnotationIds: number[] = [];
  const unhandledAnnotationIds: number[] = [];
  Object.entries(annotationsMap).forEach(([_, annotations]) => {
    const annotationIdsByStatus =
      AnnotationUtils.filterAnnotationsIdsByAnnotationStatus(annotations);
    rejectedAnnotationIds.push(...annotationIdsByStatus.rejectedAnnotationIds);
    acceptedAnnotationIds.push(...annotationIdsByStatus.acceptedAnnotationIds);
    unhandledAnnotationIds.push(
      ...annotationIdsByStatus.unhandledAnnotationIds
    );
  });
  const tags = (
    <CellContainer>
      {!!unhandledAnnotationIds.length &&
        createTag('Unhandled', unhandledAnnotationIds.length, 'default')}
      {!!rejectedAnnotationIds.length &&
        createTag('Rejected', rejectedAnnotationIds.length, 'default')}
      {!!acceptedAnnotationIds.length &&
        createTag('Accepted', acceptedAnnotationIds.length, 'default')}
    </CellContainer>
  );
  return rejectedAnnotationIds.length > 0 ||
    acceptedAnnotationIds.length > 0 ||
    unhandledAnnotationIds.length > 0 ? (
    tags
  ) : (
    <Body level={3}>No annotations</Body>
  );
}

const CellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
  column-gap: 2px;
`;
