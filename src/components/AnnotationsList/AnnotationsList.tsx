import React, { useEffect, useState } from 'react';
import { CogniteAnnotation } from '@cognite/annotations';
import styled from 'styled-components';
import { Body, Button, Graphic, SegmentedControl } from '@cognite/cogs.js';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import { lightGrey } from 'utils/Colors';
import { ResourceIcons } from 'components';
import {
  ProposedCogniteAnnotation,
  useSelectedAnnotations,
} from '@cognite/react-picture-annotation';

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
  const [filterType, setFilterType] = useState<AnnotationType>('pending');
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

  return (
    <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
      <ResourcePreviewWrapper>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            icon="ArrowBack"
            onClick={goBack}
            style={{ color: 'black', marginTop: '-5px' }}
            type="ghost"
          />
          <BreadcrumbItem separator={<span />}>
            {type?.toLocaleUpperCase()}
          </BreadcrumbItem>
        </div>
        <SegmentedControl
          style={{ marginRight: 24 }}
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
          {filteredList.length ? (
            filteredList.map(an => (
              <ListItem
                key={an.id}
                onClick={() => handleClick(an)}
                pending={an.status === 'unhandled'}
              >
                <ResourceIcons
                  style={{
                    marginTop: '-5px',
                    background: 'transparent',
                  }}
                  type={type === 'files' ? 'file' : 'asset'}
                />
                <Body
                  style={{
                    color: an.status === 'unhandled' ? '#4255BB' : '#333333',
                  }}
                  level={2}
                  strong
                >
                  {an.label ?? 'N/A'}
                </Body>
              </ListItem>
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
  height: 100%;
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
    <p>No {type !== 'all' ? type : ''} annotations found.</p>
  </div>
);
