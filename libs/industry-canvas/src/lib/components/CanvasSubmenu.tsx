import styled from 'styled-components';

import { formatDistanceToNow } from 'date-fns';

import { Body, Colors, Menu } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';
import { SerializedCanvasDocument } from '../types';

type CanvasSubmenuProps = {
  isActiveCanvas: boolean;
  canvas: SerializedCanvasDocument;
  onRenameCanvasClick: () => void;
  onCopyLinkClick: (canvas: SerializedCanvasDocument) => void;
  onDeleteCanvasClick: (canvas: SerializedCanvasDocument) => void;
  onCanvasItemClick: (canvas: SerializedCanvasDocument) => void;
  isCanvasLocked: boolean;
};

const CanvasSubmenu: React.FC<CanvasSubmenuProps> = ({
  canvas,
  isActiveCanvas,
  isCanvasLocked,
  onRenameCanvasClick,
  onCopyLinkClick,
  onDeleteCanvasClick,
  onCanvasItemClick,
}) => {
  const { t } = useTranslation();
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
            {t(translationKeys.COMMON_CANVAS_LINK_COPY, 'Copy link')}
          </Menu.Item>
          {isActiveCanvas && (
            <Menu.Item
              disabled={isCanvasLocked}
              icon="Edit"
              iconPlacement="left"
              onClick={onRenameCanvasClick}
            >
              {t(translationKeys.COMMON_CANVAS_RENAME, 'Rename')}
            </Menu.Item>
          )}
          <Menu.Item
            style={{
              color: Colors['text-icon--status-critical'],
            }}
            disabled={isCanvasLocked}
            destructive={true}
            icon="Delete"
            iconPlacement="left"
            onClick={() => onDeleteCanvasClick(canvas)}
          >
            {t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')}
          </Menu.Item>
        </StyledMenu>
      }
    >
      <>
        <div onClick={() => onCanvasItemClick(canvas)}>{canvas.name}</div>
        <LastTimeText onClick={() => onCanvasItemClick(canvas)} level={2}>
          {isActiveCanvas === true ? (
            t(
              translationKeys.CANVAS_DROPDOWN_CURRENTLY_VIEWING,
              'Currently viewing'
            )
          ) : (
            <LastTimeText level={2}>
              Updated{' '}
              {formatDistanceToNow(new Date(canvas.updatedAt), {
                addSuffix: true,
              })}
            </LastTimeText>
          )}
        </LastTimeText>
      </>
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
