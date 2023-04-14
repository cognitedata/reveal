import { createLink } from '@cognite/cdf-utilities';
import { Body, Button, Dropdown, Menu } from '@cognite/cogs.js';
import { formatDistanceToNow } from 'date-fns';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { SerializedCanvasDocument } from '../types';

type CanvasDropdownProps = Pick<
  IndustryCanvasContextType,
  | 'activeCanvas'
  | 'canvases'
  | 'archiveCanvas'
  | 'isListingCanvases'
  | 'isArchivingCanvas'
>;

const CanvasDropdown: React.FC<CanvasDropdownProps> = ({
  activeCanvas,
  canvases,
  archiveCanvas,
  isListingCanvases,
  isArchivingCanvas,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = useCallback(
    (canvas: SerializedCanvasDocument) =>
      canvas.externalId === activeCanvas?.externalId,
    [activeCanvas]
  );

  const onCanvasItemClick = (canvas: SerializedCanvasDocument) => {
    navigate(
      createLink('/explore/industryCanvas', {
        canvasId: canvas.externalId,
      })
    );
    setIsOpen(false);
  };

  const onCanvasArchiveClick = (canvas: SerializedCanvasDocument) => {
    archiveCanvas(canvas);
    setIsOpen(false);
  };
  return (
    <Dropdown
      key="CanvasDropdown"
      visible={isOpen}
      onClickOutside={() => setIsOpen(false)}
      content={
        <StyledMenu key="CanvasMenu">
          {canvases.length === 0 ? (
            <EmptyCanvasesPlaceholder arias-label="create-canvas-description">
              Please create your first canvas to persist your changes in
              Industry Canvas
            </EmptyCanvasesPlaceholder>
          ) : (
            canvases.map((canvas) => (
              <Menu.Item
                key={canvas.externalId}
                onClick={() => onCanvasItemClick(canvas)}
                toggled={isSelected(canvas)}
                action={{
                  'aria-label': 'Delete Canvas',
                  icon: 'Delete',
                  onClick: () => onCanvasArchiveClick(canvas),
                }}
              >
                {canvas.name}
                <LastTimeText level={2}>
                  Updated{' '}
                  {formatDistanceToNow(new Date(canvas.updatedAt), {
                    addSuffix: true,
                  })}
                </LastTimeText>
              </Menu.Item>
            ))
          )}
        </StyledMenu>
      }
    >
      <NavigationButton
        icon="ChevronDown"
        iconPlacement="right"
        toggled={canvases.some(isSelected)}
        onClick={() => setIsOpen(!isOpen)}
        loading={isListingCanvases || isArchivingCanvas}
      >
        Canvases
      </NavigationButton>
    </Dropdown>
  );
};

const NavigationButton = styled(Button)`
  margin-left: 6px;
`;

const StyledMenu = styled(Menu)`
  min-width: 300px;
  max-height: 250px;
  overflow: auto;
  display: block;
`;

const EmptyCanvasesPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  row-gap: 16px;
`;

const LastTimeText = styled(Body)`
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  color: rgba(0, 0, 0, 0.55);
  margin-right: 12px;
`;

export default CanvasDropdown;
