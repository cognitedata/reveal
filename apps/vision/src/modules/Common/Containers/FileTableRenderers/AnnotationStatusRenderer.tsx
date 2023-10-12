import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Tag } from 'antd';

import { Body } from '@cognite/cogs.js';

import { RootState } from '../../../../store/rootReducer';
import { makeSelectAnnotationsForFileIds } from '../../store/annotation/selectors';
import { CellRenderer } from '../../types';
import { filterAnnotationIdsByAnnotationStatus } from '../../Utils/AnnotationUtils/AnnotationUtils';

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
  const annotationsMap = useSelector(({ annotationReducer }: RootState) =>
    selectAnnotationsForFileIds(annotationReducer, [id])
  );

  const rejectedAnnotationIds: number[] = [];
  const acceptedAnnotationIds: number[] = [];
  const unhandledAnnotationIds: number[] = [];
  Object.entries(annotationsMap).forEach(([_, annotations]) => {
    const annotationIdsByStatus =
      filterAnnotationIdsByAnnotationStatus(annotations);
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
