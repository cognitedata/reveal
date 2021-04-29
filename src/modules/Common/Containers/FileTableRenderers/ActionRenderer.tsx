import React, { useMemo } from 'react';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { AnnotationsBadgeProps } from 'src/modules/Workflow/types';
import { CellRenderer } from 'src/modules/Common/Types';
import styled from 'styled-components';

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;

export function ActionRenderer({ rowData: { menu, id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );

  const handleMetadataEdit = () => {
    if (menu?.showMetadataPreview) {
      menu.showMetadataPreview(id);
    }
  };

  const showMenu = !!menu.showMetadataPreview;

  // todo: bind actions
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleMetadataEdit}>Edit file details</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
    </Menu>
  );

  const handleReview = () => {
    if (menu?.onReviewClick) {
      menu.onReviewClick(id);
    }
  };
  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;
  const reviewDisabled = annotations.some((key) =>
    ['Queued', 'Running'].includes(annotationsBadgeProps[key]?.status || '')
  );

  return (
    <Action>
      <Button
        type="secondary"
        icon="ArrowRight"
        iconPlacement="right"
        style={{ marginRight: '10px' }}
        onClick={handleReview}
        disabled={reviewDisabled}
      >
        Review
      </Button>
      {showMenu && (
        <Dropdown content={MenuContent}>
          <Button
            type="secondary"
            icon="MoreOverflowEllipsisHorizontal"
            aria-label="dropdown button"
          />
        </Dropdown>
      )}
    </Action>
  );
}
