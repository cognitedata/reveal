import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import styled from 'styled-components';

import { COPIED_TEXT, useClipboard } from '@data-exploration-lib/core';
import { useDebounce } from 'use-debounce';
import { v4 as uuid } from 'uuid';

import {
  Button,
  Divider,
  Dropdown,
  InputExp,
  Menu,
  toast,
  Tooltip,
} from '@cognite/cogs.js';

import { TOAST_POSITION } from '../constants';
import { EMPTY_FLEXIBLE_LAYOUT } from '../hooks/constants';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { SerializedCanvasDocument } from '../types';
import { getCanvasLink } from '../utils/getCanvasLink';

import CanvasDeletionModal from './CanvasDeletionModal';
import CanvasSubmenu from './CanvasSubmenu';

const SEARCH_DEBOUNCE_MS = 300;

type CanvasDropdownProps = Pick<
  IndustryCanvasContextType,
  | 'activeCanvas'
  | 'canvases'
  | 'archiveCanvas'
  | 'createCanvas'
  | 'isListingCanvases'
  | 'isArchivingCanvas'
  | 'isSavingCanvas'
  | 'isLoadingCanvas'
  | 'isCreatingCanvas'
  | 'setCanvasId'
> & {
  setIsEditingTitle: Dispatch<SetStateAction<boolean>>;
};

const CanvasDropdown: React.FC<CanvasDropdownProps> = ({
  activeCanvas,
  canvases,
  archiveCanvas,
  createCanvas,
  isListingCanvases,
  isArchivingCanvas,
  isLoadingCanvas,
  isSavingCanvas,
  isCreatingCanvas,
  setIsEditingTitle,
  setCanvasId,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);
  const { onCopy } = useClipboard();
  const [canvasToDelete, setCanvasToDelete] = useState<
    SerializedCanvasDocument | undefined
  >(undefined);
  const onCanvasItemClick = (canvas: SerializedCanvasDocument) => {
    setCanvasId(canvas.externalId);
    setIsMenuOpen(false);
  };

  const onDeleteCanvas = (canvas: SerializedCanvasDocument) => {
    setCanvasToDelete(canvas);
    setIsMenuOpen(false);
  };

  const onDeleteCanvasConfirmed = (canvas: SerializedCanvasDocument) => {
    archiveCanvas(canvas);
    toast.success(`Deleted canvas '${canvas.name}'`, {
      toastId: `deleted-canvas-${canvas.externalId}`,
      position: TOAST_POSITION,
    });
    setCanvasToDelete(undefined);
  };

  const onCopyLinkClick = (canvas: SerializedCanvasDocument) => {
    onCopy(`${window.location.origin}${getCanvasLink(canvas.externalId)}`);
    toast.success(COPIED_TEXT, {
      toastId: `canvas-link-copied-${uuid()}`,
      position: TOAST_POSITION,
    });
    setIsMenuOpen(false);
  };

  const onRenameCanvasClick = () => {
    setIsEditingTitle(true);
    setIsMenuOpen(false);
  };

  const filteredCanvases = useMemo(
    () =>
      canvases
        .filter((canvas) => canvas.externalId !== activeCanvas?.externalId)
        .filter(
          (canvas) =>
            debouncedSearchString.trim().length === 0 ||
            canvas.name
              .toLowerCase()
              .includes(debouncedSearchString.toLowerCase())
        ),
    [activeCanvas?.externalId, debouncedSearchString, canvases]
  );

  return (
    <>
      <CanvasDeletionModal
        canvas={canvasToDelete}
        onCancel={() => setCanvasToDelete(undefined)}
        onDeleteCanvas={onDeleteCanvasConfirmed}
        isDeleting={isArchivingCanvas}
      />
      <Dropdown
        key="CanvasDropdown"
        visible={isMenuOpen}
        onClickOutside={() => setIsMenuOpen(false)}
        content={
          <StyledMenu key="CanvasMenu">
            <StyledInput
              aria-label="canvas-search"
              type="search"
              key="canvas-search"
              onChange={(e) => setSearchString(e.target.value)}
              value={searchString}
              variant="solid"
              placeholder="Search"
            />
            {canvases.length === 0 ? (
              <EmptyCanvasesPlaceholder arias-label="create-canvas-description">
                Please create your first canvas to persist your changes in
                Industry Canvas
              </EmptyCanvasesPlaceholder>
            ) : (
              <>
                {activeCanvas !== undefined && (
                  <>
                    <CanvasSubmenu
                      canvas={activeCanvas}
                      isActiveCanvas
                      onRenameCanvasClick={onRenameCanvasClick}
                      onCopyLinkClick={onCopyLinkClick}
                      onDeleteCanvasClick={onDeleteCanvas}
                      onCanvasItemClick={onCanvasItemClick}
                    />
                    <Divider />
                  </>
                )}
                <MenuItemsWrapper label="Public canvases">
                  {filteredCanvases.map((canvas) => (
                    <CanvasSubmenu
                      canvas={canvas}
                      isActiveCanvas={false}
                      onRenameCanvasClick={onRenameCanvasClick}
                      onCopyLinkClick={onCopyLinkClick}
                      onDeleteCanvasClick={onDeleteCanvas}
                      onCanvasItemClick={onCanvasItemClick}
                    />
                  ))}
                </MenuItemsWrapper>
              </>
            )}

            <Divider />
            <CreateCanvasButton
              aria-label="CreateCanvasButton"
              size="medium"
              type="primary"
              icon="Plus"
              loading={isCreatingCanvas || isSavingCanvas || isLoadingCanvas}
              onClick={() => {
                createCanvas({
                  canvasAnnotations: [],
                  container: EMPTY_FLEXIBLE_LAYOUT,
                });
              }}
            >
              Create new canvas
            </CreateCanvasButton>
          </StyledMenu>
        }
      >
        <Tooltip content="Show canvases" position="bottom">
          <NavigationButton
            aria-label="CanvasDropdownButton"
            key="CanvasDropdownButton"
            icon="ChevronDown"
            type="ghost"
            toggled={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            loading={isListingCanvases || isArchivingCanvas}
          />
        </Tooltip>
      </Dropdown>
    </>
  );
};

const StyledInput = styled(InputExp)`
  width: 100%;
  margin-bottom: 8px;
`;

const CreateCanvasButton = styled(Button)`
  width: 100%;
`;

const NavigationButton = styled(Button)`
  margin-left: 6px;
`;

const MenuItemsWrapper = styled(Menu.Section)`
  height: 100%;
  overflow: auto;
`;

const StyledMenu = styled(Menu)`
  min-width: 300px;
  max-height: 412px;
  overflow: auto;
`;

const EmptyCanvasesPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  row-gap: 16px;
`;

export default CanvasDropdown;
