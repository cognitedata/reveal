import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

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

import { useClipboard } from '@data-exploration-lib/core';

import { translationKeys } from '../common';
import { MetricEvent, TOAST_POSITION } from '../constants';
import useCanvasDeletion from '../hooks/useCanvasDeletion';
import useCanvasSearch from '../hooks/useCanvasSearch';
import { useTranslation } from '../hooks/useTranslation';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { SerializedCanvasDocument } from '../types';
import { getCanvasLink } from '../utils/getCanvasLink';
import useMetrics from '../utils/tracking/useMetrics';

import CanvasDeletionModal from './CanvasDeletionModal';
import CanvasSubmenu from './CanvasSubmenu';

const SEARCH_DEBOUNCE_MS = 200;
const SCROLL_HEIGHT_PERCENTAGE = 0.9; // Get next data when 90% of scroll height is reached.
const MINIMUM_NUM_CANVASES_TO_DISPLAY = 20;

type CanvasDropdownProps = Pick<
  IndustryCanvasContextType,
  | 'activeCanvas'
  | 'canvases'
  | 'createCanvas'
  | 'isListingCanvases'
  | 'isSavingCanvas'
  | 'isLoadingCanvas'
  | 'isCreatingCanvas'
  | 'setCanvasId'
> & {
  setIsEditingTitle: Dispatch<SetStateAction<boolean>>;
  isCanvasLocked: boolean;
};

const CanvasDropdown: React.FC<CanvasDropdownProps> = ({
  activeCanvas,
  canvases,
  createCanvas,
  isListingCanvases,
  isLoadingCanvas,
  isSavingCanvas,
  isCreatingCanvas,
  setIsEditingTitle,
  setCanvasId,
  isCanvasLocked,
}) => {
  const trackUsage = useMetrics();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);
  const [numCanvasesToDisplay, setNumCanvasesToDisplay] = useState<number>(
    MINIMUM_NUM_CANVASES_TO_DISPLAY
  );
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { filteredCanvases } = useCanvasSearch({
    canvases,
    searchString: debouncedSearchString,
  });
  const {
    canvasToDelete,
    setCanvasToDelete,
    onDeleteCanvasConfirmed,
    isDeletingCanvas,
  } = useCanvasDeletion();
  const { onCopy } = useClipboard();
  const onCanvasItemClick = (canvas: SerializedCanvasDocument) => {
    setCanvasId(canvas.externalId);
    setIsMenuOpen(false);
  };

  const onDeleteCanvas = (canvas: SerializedCanvasDocument) => {
    if (isCanvasLocked) {
      return;
    }
    setCanvasToDelete(canvas);
    setIsMenuOpen(false);
  };

  const onCopyLinkClick = (canvas: SerializedCanvasDocument) => {
    onCopy(`${window.location.origin}${getCanvasLink(canvas.externalId)}`);
    toast.success(
      <div>
        <b>
          {t(translationKeys.CANVAS_LINK_COPIED_TITLE, 'Canvas link copied')}
        </b>
        <p>
          {t(
            translationKeys.CANVAS_LINK_COPIED_SUB_TITLE,
            'Canvas link successfully copied to your clipboard'
          )}
        </p>
      </div>,
      {
        toastId: `canvas-link-copied-${uuid()}`,
        position: TOAST_POSITION,
      }
    );
    setIsMenuOpen(false);
  };

  const onRenameCanvasClick = () => {
    if (isCanvasLocked) {
      return;
    }

    setIsEditingTitle(true);
    setIsMenuOpen(false);
  };

  const onCreateCanvasClick = async () => {
    const { externalId } = await createCanvas();
    navigate(getCanvasLink(externalId));
  };

  useEffect(() => {
    if (isMenuOpen) {
      trackUsage(MetricEvent.CANVAS_DROPDOWN_OPENED);
    }
  }, [isMenuOpen, trackUsage]);

  useEffect(() => {
    setNumCanvasesToDisplay(MINIMUM_NUM_CANVASES_TO_DISPLAY);
  }, [debouncedSearchString]);

  const handleMenuScroll = (e: SyntheticEvent): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
    if (scrollTop + clientHeight < scrollHeight * SCROLL_HEIGHT_PERCENTAGE) {
      return;
    }
    if (numCanvasesToDisplay >= filteredCanvases.length) {
      return;
    }
    setNumCanvasesToDisplay(
      numCanvasesToDisplay + MINIMUM_NUM_CANVASES_TO_DISPLAY
    );
  };

  return (
    <>
      <CanvasDeletionModal
        canvas={canvasToDelete}
        onCancel={() => setCanvasToDelete(undefined)}
        onDeleteCanvas={onDeleteCanvasConfirmed}
        isDeleting={isDeletingCanvas}
      />
      <Dropdown
        key="CanvasDropdown"
        visible={isMenuOpen}
        onClickOutside={() => setIsMenuOpen(false)}
        content={
          <StyledMenu key="CanvasMenu">
            <StyledInput
              aria-label="canvas-search"
              autoFocus
              fullWidth
              type="search"
              key="canvas-search"
              onChange={(e) => setSearchString(e.target.value)}
              value={searchString}
              variant="solid"
              placeholder={t(translationKeys.CANVAS_DROPDOWN_SEARCH, 'Search')}
              onKeyDown={(e) => {
                // Need to stop propagation to fix losing focus
                // Check https://github.com/mui/material-ui/issues/19096#issuecomment-570918052
                e.stopPropagation();
              }}
            />
            {canvases.length === 0 ? (
              <EmptyCanvasesPlaceholder arias-label="create-canvas-description">
                {t(
                  translationKeys.EMPTY_CANVAS_PLACEHOLDER,
                  'Please create your first canvas to persist your changes in Industrial Canvas'
                )}
              </EmptyCanvasesPlaceholder>
            ) : (
              <>
                {activeCanvas !== undefined && (
                  <>
                    <CanvasSubmenu
                      canvas={activeCanvas}
                      isActiveCanvas
                      isCanvasLocked={isCanvasLocked}
                      onRenameCanvasClick={onRenameCanvasClick}
                      onCopyLinkClick={onCopyLinkClick}
                      onDeleteCanvasClick={onDeleteCanvas}
                      onCanvasItemClick={onCanvasItemClick}
                    />
                    <Divider />
                  </>
                )}
                <MenuItemsWrapper
                  onScroll={handleMenuScroll}
                  className="cogs-menu-section"
                >
                  <div className="cogs-menu-header">
                    {t(
                      translationKeys.PUBLIC_CANVASES_LIST_DROPDOWN,
                      'Public canvases'
                    )}
                  </div>
                  {filteredCanvases
                    .slice(0, numCanvasesToDisplay)
                    .filter(
                      (canvas) => canvas.externalId !== activeCanvas?.externalId
                    )
                    .map((canvas) => (
                      <CanvasSubmenu
                        key={`canvas-dropdown-submenu-${canvas.externalId}`}
                        canvas={canvas}
                        isActiveCanvas={false}
                        isCanvasLocked={isCanvasLocked}
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
              aria-label={t(
                translationKeys.COMMON_CREATE_CANVAS,
                'Create new canvas'
              )}
              size="medium"
              type="primary"
              icon="Plus"
              loading={isCreatingCanvas || isSavingCanvas || isLoadingCanvas}
              onClick={onCreateCanvasClick}
            >
              {t(translationKeys.COMMON_CREATE_CANVAS, 'Create new canvas')}
            </CreateCanvasButton>
          </StyledMenu>
        }
      >
        <Tooltip
          content={t(
            translationKeys.TOOLTIP_SHOW_CANVAS_DROPDOWN,
            'Show canvases'
          )}
          position="bottom"
          // attaching the tooltip to document.body to not break the style of parent container
          appendTo={document.body}
        >
          <NavigationButton
            aria-label={t(
              translationKeys.TOOLTIP_SHOW_CANVAS_DROPDOWN,
              'Show canvases'
            )}
            key="CanvasDropdownButton"
            icon="ChevronDown"
            type="ghost"
            toggled={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            loading={isListingCanvases || isDeletingCanvas || isLoadingCanvas}
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
  margin-top: 2px;
  width: 100%;
`;

const NavigationButton = styled(Button)`
  margin-left: 6px;
`;

const MenuItemsWrapper = styled.div`
  height: 100%;
  overflow: auto;
  ::-webkit-scrollbar {
    width: 14px;
  }

  ::-webkit-scrollbar-thumb {
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: #aaaaaa;
  }
`;

const StyledMenu = styled(Menu)`
  width: 300px;
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
