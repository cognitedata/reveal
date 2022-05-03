import React, { useEffect, useState } from 'react';
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

import { lightGrey } from 'utils/Colors';
import { ResourceIcons } from 'components';
import {
  ProposedCogniteAnnotation,
  useSelectedAnnotations,
} from '@cognite/react-picture-annotation';
import capitalize from 'lodash/capitalize';

interface AnnotationsListProps {
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  type: 'assets' | 'files';
  goBack: () => void;
}
type AnnotationType = 'pending' | 'approved' | 'all';

const AnnotationsList = ({
  annotations,
  type,
  goBack,
}: AnnotationsListProps) => {
  const [filterType, setFilterType] = useState<AnnotationType>('all');
  const [filteredList, setFilteredList] = useState<
    Array<CogniteAnnotation | ProposedCogniteAnnotation>
  >([]);

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
    <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
      <ResourcePreviewWrapper>
        <Flex direction="row" style={{ flex: '0 0 auto' }}>
          <Button
            icon="ArrowLeft"
            onClick={goBack}
            style={{ color: 'black', marginTop: '-7px' }}
            type="ghost"
          />
          <StyledBreadCrumbItem>{capitalize(type)}</StyledBreadCrumbItem>
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
          {filteredList.length ? (
            filteredList.map(an => (
              <AnnotationItem key={an.id} annotation={an} />
            ))
          ) : (
            <EmptyState type={filterType} />
          )}
        </ListWrapper>
      </ResourcePreviewWrapper>
    </div>
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

const ResourcePreviewWrapper = styled.div`
  height: calc(100vh - 250px);
  overflow: hidden;
  min-width: 360px;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: -1px;
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

export const StyledBreadCrumbItem = styled.div`
  padding: 0 10px;
  color: #374151;
`;
