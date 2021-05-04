import React, { useMemo } from 'react';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Button, Dropdown, Menu, Popconfirm } from '@cognite/cogs.js';
import { AnnotationsBadgeProps } from 'src/modules/Workflow/types';
import { CellRenderer } from 'src/modules/Common/Types';
import styled from 'styled-components';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;

export function ActionRenderer({ rowData: { menu, id } }: CellRenderer) {
  const dispatch = useDispatch();

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

  const handleFileDelete = () => {
    dispatch(deleteFilesById([{ id }]));
  };

  const showMenu = !!menu.showMetadataPreview;

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

  // todo: bind actions
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleMetadataEdit}>Edit file details</Menu.Item>
      <Popconfirm
        icon="WarningFilled"
        placement="bottom-end"
        onConfirm={handleFileDelete}
        content="Are you sure you want to permanently delete this file?"
      >
        <Menu.Item disabled={reviewDisabled}>Delete</Menu.Item>
      </Popconfirm>
    </Menu>
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
