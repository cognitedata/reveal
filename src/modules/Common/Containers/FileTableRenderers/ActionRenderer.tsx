import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Button, Dropdown, Menu, Popconfirm } from '@cognite/cogs.js';
import { CellRenderer } from 'src/modules/Common/types';
import styled from 'styled-components';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;

export function ActionRenderer({ rowData: { menu, id } }: CellRenderer) {
  const dispatch = useDispatch();

  const handleMetadataEdit = () => {
    if (menu?.showMetadataPreview) {
      menu.showMetadataPreview(id);
    }
  };

  const handleFileDelete = () => {
    dispatch(DeleteAnnotationsByFileIds([id]));
    dispatch(deleteFilesById([{ id }]));
  };

  const showMenu = !!menu.showMetadataPreview;

  const handleReview = () => {
    if (menu?.onReviewClick) {
      menu.onReviewClick(id);
    }
  };

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);
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
        aria-label="Review"
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
