import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import { ResourceIcons } from '@data-exploration-components/components/index';
import { isNotUndefined } from '@data-exploration-components/utils/index';
import { Breadcrumb } from 'antd';
import capitalize from 'lodash/capitalize';
import uniq from 'lodash/uniq';

import {
  Body,
  Button,
  Colors,
  Flex,
  Illustrations,
  Icon,
  SegmentedControl,
} from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { ExtendedAnnotation, useTranslation } from '@data-exploration-lib/core';

import {
  getExtendedAnnotationLabel,
  getResourceIdFromExtendedAnnotation,
  isApprovedAnnotation,
  isSuggestedAnnotation,
} from '../migration/utils';

interface AnnotationsListProps {
  annotations: ExtendedAnnotation[];
  type: 'assets' | 'files';
  goBack: () => void;
  reset: () => void;
  setSelectedAnnotations: (annotations: ExtendedAnnotation[]) => void;
}

type AnnotationType = 'pending' | 'approved' | 'all';

const AnnotationsList = ({
  annotations,
  type,
  goBack,
  reset,
  setSelectedAnnotations,
}: AnnotationsListProps) => {
  const { t } = useTranslation();

  const [filterType, setFilterType] = useState<AnnotationType>('all');
  const [filteredList, setFilteredList] = useState<ExtendedAnnotation[]>([]);

  const filteredListIdsEither = uniq(
    filteredList.map(getResourceIdFromExtendedAnnotation)
  )
    .filter(isNotUndefined)
    .map((id) => ({ id }));

  const { data: assetsResources = [] } = useCdfItems<Asset>(
    'assets',
    filteredListIdsEither,
    false,
    {
      enabled: filteredListIdsEither.length > 0,
    }
  );
  const filteredItemWithName: (ExtendedAnnotation & { label: string })[] =
    useMemo(
      () =>
        filteredList.map((item) => {
          const assetDetail = assetsResources.find(
            (resource) =>
              resource.id === getResourceIdFromExtendedAnnotation(item)
          );
          const annotationLabel = getExtendedAnnotationLabel(item);
          return {
            ...item,
            label: annotationLabel ? annotationLabel : assetDetail?.name ?? '',
          };
        }),
      [assetsResources, filteredList]
    );

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredList(annotations);
    } else {
      setFilteredList(annotations.filter(filterByStatus));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, annotations]);

  const filterByStatus = (annotation: ExtendedAnnotation) =>
    filterType === 'pending'
      ? isSuggestedAnnotation(annotation)
      : isApprovedAnnotation(annotation);

  const handleClick = (annotation: ExtendedAnnotation) => {
    setSelectedAnnotations([annotation]);
  };

  const handleGoBack = () => {
    reset?.();
    goBack();
  };

  const getColor = (annotation: ExtendedAnnotation) =>
    isSuggestedAnnotation(annotation)
      ? Colors['border--interactive--toggled-hover']
      : Colors['surface--misc-canvas--inverted'];

  const AnnotationItem = ({
    annotation,
  }: {
    annotation: ExtendedAnnotation;
  }) => (
    <ListItem
      key={annotation.id}
      onClick={() => handleClick(annotation)}
      pending={isSuggestedAnnotation(annotation)}
    >
      <Flex direction="row">
        <ResourceIcons
          style={{
            marginTop: '-5px',
            background: 'transparent',
          }}
          type={type === 'files' ? 'file' : 'asset'}
        />
        <Body
          style={{
            color: getColor(annotation),
          }}
          level={2}
          strong
        >
          {getExtendedAnnotationLabel(annotation) || 'N/A'}
        </Body>
      </Flex>
      <Icon type="ChevronRight" />
    </ListItem>
  );
  return (
    <>
      <AnnotationListContainer>
        <Flex direction="row" style={{ flex: '0 0 auto' }}>
          <Button
            icon="ArrowLeft"
            onClick={handleGoBack}
            style={{ color: 'black', marginTop: '-7px' }}
            type="ghost"
          />
          <Breadcrumb>
            <Breadcrumb.Item separator={<span />}>
              {capitalize(type)}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Flex>
        <SegmentedControl
          style={{ marginRight: 24, flex: '0 0 auto' }}
          currentKey={filterType}
          fullWidth
          onButtonClicked={(key: string) =>
            setFilterType(key as AnnotationType)
          }
        >
          <SegmentedControl.Button key="all">
            {t('ALL', 'All')}
          </SegmentedControl.Button>
          <SegmentedControl.Button key="pending">
            {t('PENDING', 'Pending')}
          </SegmentedControl.Button>
          <SegmentedControl.Button key="approved">
            {t('APPROVED', 'Approved')}
          </SegmentedControl.Button>
        </SegmentedControl>
        <ListWrapper>
          <div>
            {filteredList.length} {type}{' '}
          </div>
          {filteredItemWithName.length ? (
            filteredItemWithName.map((an) =>
              an ? <AnnotationItem key={an.id} annotation={an} /> : null
            )
          ) : (
            <EmptyState type={filterType} />
          )}
        </ListWrapper>
      </AnnotationListContainer>
    </>
  );
};

export default AnnotationsList;

type TagProps = {
  pending?: boolean;
};

const ListItem = styled.div<TagProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 8px 4px;
  width: 100%;
  background: ${({ pending }: TagProps) =>
    pending ? 'var(--cogs-midblue-8)' : 'var(--cogs-bg-default)'};
  color: ${({ pending }: TagProps) =>
    pending ? 'var(--cogs-text-primary)' : 'var(--cogs-text-info)'};
  margin: 6px 0px 6px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid
    ${({ pending }: TagProps) =>
      pending ? 'var(--cogs-midblue-5)' : 'var(--cogs-greyscale-grey4)'};
  cursor: pointer;
  :hover {
    background: ${({ pending }) =>
      pending ? 'var(--cogs-bg-selected)' : 'var(--cogs-bg-hover)'};
  }
`;

const AnnotationListContainer = styled.div`
  min-width: 360px;
  background: #fff;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 15px;
  padding: 20px 16px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 5px;
  height: 100%;
  overflow: auto;
`;

const EmptyState = ({ type }: { type: AnnotationType }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      height: '100%',
    }}
  >
    <Illustrations.Solo type="EmptyStateSearch" />
    <p>No {type !== 'all' ? type : ''} tags found.</p>
  </div>
);
