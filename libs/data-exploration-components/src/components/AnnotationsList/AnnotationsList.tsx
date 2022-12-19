import React, { useEffect, useMemo, useState } from 'react';
import { CogniteAnnotation } from '@cognite/annotations';
import styled from 'styled-components';
import {
  Body,
  Button,
  Flex,
  Graphic,
  Icon,
  SegmentedControl,
} from '@cognite/cogs.js';
import { Breadcrumb } from 'antd';
import { ResourceIcons } from '@data-exploration-components/components';
import {
  ProposedCogniteAnnotation,
  useSelectedAnnotations,
  useZoomControls,
} from '@cognite/react-picture-annotation';
import capitalize from 'lodash/capitalize';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';

interface AnnotationsListProps {
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  type: 'assets' | 'files';
  goBack: () => void;
  setZoomedAnnotation: (zoomedAnnotation: CogniteAnnotation) => void;
}

type AnnotationType = 'pending' | 'approved' | 'all';

/**
 * @deprecated This copy is left here until UFV migration is complete, upon which it can be deleted.
 * The UFV copy is in the UFV folder.
 */
const AnnotationsList = ({
  annotations,
  type,
  goBack,
  setZoomedAnnotation,
}: AnnotationsListProps) => {
  const [filterType, setFilterType] = useState<AnnotationType>('all');
  const [filteredList, setFilteredList] = useState<
    Array<CogniteAnnotation | ProposedCogniteAnnotation>
  >([]);
  const { reset } = useZoomControls();

  const set = new Set<number>();
  filteredList.forEach(({ resourceId = 0 }) => {
    set.add(+resourceId);
  });
  const { data: assetsResources = [] } = useCdfItems<Asset>(
    'assets',
    Array.from(set).map((id) => ({ id })),
    false,
    {
      enabled: filteredList.length > 0,
    }
  );
  const filteredItemWithName = useMemo(
    () =>
      filteredList.map((item) => {
        const assetDetail = assetsResources.find(
          (resource) => resource.id === item.resourceId!
        );
        return {
          ...item,
          label: item.label ? item.label : assetDetail?.name ?? '',
        };
      }),
    [assetsResources, filteredList]
  );

  const { setSelectedAnnotations } = useSelectedAnnotations();

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredList(annotations);
    } else {
      setFilteredList(annotations.filter(filterByStatus));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, annotations]);

  const filterByStatus = (an: CogniteAnnotation | ProposedCogniteAnnotation) =>
    filterType === 'pending'
      ? !!(an.status === 'unhandled')
      : !!(an.status === 'verified');

  const handleClick = (
    annotation: CogniteAnnotation | ProposedCogniteAnnotation
  ) => {
    setSelectedAnnotations([annotation]);
    setZoomedAnnotation(annotation as CogniteAnnotation);
  };

  const handleGoBack = () => {
    reset?.();
    goBack();
  };

  const AnnotationItem = ({
    annotation,
  }: {
    annotation: CogniteAnnotation | ProposedCogniteAnnotation;
  }) => (
    <ListItem
      key={annotation.id}
      onClick={() => handleClick(annotation)}
      pending={annotation.status === 'unhandled'}
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
            color: annotation.status === 'unhandled' ? '#4255BB' : '#333333',
          }}
          level={2}
          strong
        >
          {annotation.label ?? 'N/A'}
        </Body>
      </Flex>
      <Icon
        type="ChevronRight"
        style={{
          marginTop: '3px',
          color: annotation.status === 'unhandled' ? '#4255BB' : '#333333',
        }}
      />
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
          variant="default"
          fullWidth
          onButtonClicked={(key: string) =>
            setFilterType(key as AnnotationType)
          }
        >
          <SegmentedControl.Button key="all">All</SegmentedControl.Button>
          <SegmentedControl.Button key="pending">
            Pending
          </SegmentedControl.Button>
          <SegmentedControl.Button key="approved">
            Approved
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
    <Graphic type="Search" />
    <p>No {type !== 'all' ? type : ''} tags found.</p>
  </div>
);
