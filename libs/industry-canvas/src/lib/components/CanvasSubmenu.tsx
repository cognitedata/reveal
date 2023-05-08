import { Body, Colors, Menu } from '@cognite/cogs.js';
import { SerializedCanvasDocument } from '../types';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

type CanvasSubmenuProps = {
  isActiveCanvas: boolean;
  canvas: SerializedCanvasDocument;
  onRenameCanvasClick: () => void;
  onCopyLinkClick: (canvas: SerializedCanvasDocument) => void;
  onDeleteCanvasClick: (canvas: SerializedCanvasDocument) => void;
  onCanvasItemClick: (canvas: SerializedCanvasDocument) => void;
};

const CanvasSubmenu: React.FC<CanvasSubmenuProps> = ({
  canvas,
  isActiveCanvas,
  onRenameCanvasClick,
  onCopyLinkClick,
  onDeleteCanvasClick,
  onCanvasItemClick,
}) => {
  return (
    <Menu.Submenu
      key={`submenu-${canvas.externalId}`}
      content={
        <StyledMenu isActiveCanvas={isActiveCanvas}>
          <Menu.Item
            icon="Link"
            iconPlacement="left"
            onClick={() => onCopyLinkClick(canvas)}
          >
            Copy link
          </Menu.Item>
          {isActiveCanvas && (
            <Menu.Item
              icon="Edit"
              iconPlacement="left"
              onClick={onRenameCanvasClick}
            >
              Rename
            </Menu.Item>
          )}
          <Menu.Item
            style={{
              color: Colors['text-icon--status-critical'],
            }}
            destructive={true}
            icon="Delete"
            iconPlacement="left"
            onClick={() => onDeleteCanvasClick(canvas)}
          >
            Delete canvas
          </Menu.Item>
        </StyledMenu>
      }
    >
      <div onClick={() => onCanvasItemClick(canvas)}>{canvas.name}</div>
      <LastTimeText onClick={() => onCanvasItemClick(canvas)} level={2}>
        {isActiveCanvas === true ? (
          'Currently viewing'
        ) : (
          <LastTimeText level={2}>
            Updated{' '}
            {formatDistanceToNow(new Date(canvas.updatedAt), {
              addSuffix: true,
            })}
          </LastTimeText>
        )}
      </LastTimeText>
    </Menu.Submenu>
  );
};

const StyledMenu = styled(Menu)<{ isActiveCanvas: boolean }>`
  position: absolute;
  top: ${(prop) => (prop.isActiveCanvas ? -10 : 0)}px;
`;

const LastTimeText = styled(Body)`
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  color: rgba(0, 0, 0, 0.55);
  margin-right: 12px;
`;

export default CanvasSubmenu;
