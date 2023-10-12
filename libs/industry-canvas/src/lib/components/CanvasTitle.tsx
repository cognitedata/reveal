import {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';

import styled from 'styled-components';

import { Button, Input, Heading, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { DEFAULT_CANVAS_NAME } from '../services/IndustryCanvasService';

type CanvasTitleProps = Pick<
  IndustryCanvasContextType,
  'activeCanvas' | 'saveCanvas'
> & {
  isEditingTitle: boolean;
  setIsEditingTitle: Dispatch<SetStateAction<boolean>>;
  isCanvasLocked: boolean;
};

export const CanvasTitle: React.FC<CanvasTitleProps> = ({
  activeCanvas,
  saveCanvas,
  isEditingTitle,
  setIsEditingTitle,
  isCanvasLocked,
}) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [name, setName] = useState(activeCanvas?.name ?? DEFAULT_CANVAS_NAME);
  const { t } = useTranslation();

  useEffect(() => {
    setName(activeCanvas?.name ?? '');
  }, [activeCanvas]);

  const onCancelInput = useCallback(() => {
    setName(activeCanvas?.name ?? DEFAULT_CANVAS_NAME);
    setIsEditingTitle(false);
  }, [activeCanvas?.name, setName, setIsEditingTitle]);

  const onEditCanvasName = useCallback(async () => {
    if (isEditingTitle && activeCanvas !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        onCancelInput();
        return;
      }

      await saveCanvas({ ...activeCanvas, name: trimmedName });
      setIsEditingTitle(false);
      return;
    }
    setIsEditingTitle(true);
  }, [
    name,
    isEditingTitle,
    activeCanvas,
    setIsEditingTitle,
    saveCanvas,
    onCancelInput,
  ]);

  useEffect(() => {
    if (inputRef === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEditCanvasName();
      }

      if (e.key === 'Escape') {
        onCancelInput();
      }
    };

    inputRef.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    inputRef,
    activeCanvas?.name,
    onEditCanvasName,
    onCancelInput,
    setName,
    setIsEditingTitle,
  ]);

  const onCanvasTitleClick = () => {
    if (isCanvasLocked) {
      return;
    }

    setIsEditingTitle(true);
  };

  return (
    <StyledCanvasTitle
      $isEditable={isEditingTitle}
      level={5}
      onClick={onCanvasTitleClick}
    >
      {isEditingTitle ? (
        <Input
          autoFocus
          style={{ maxWidth: '300px' }}
          onChange={(e) => setName(e.target.value)}
          onBlur={onEditCanvasName}
          value={name}
          ref={(ref) => setInputRef(ref)}
        />
      ) : (
        <Tooltip
          content={t(translationKeys.COMMON_CANVAS_RENAME, 'Rename')}
          placement="bottom"
        >
          <span>{name}</span>
        </Tooltip>
      )}
      {activeCanvas !== undefined && isEditingTitle && (
        <Button
          icon="Checkmark"
          aria-label={t(translationKeys.COMMON_CANVAS_RENAME, 'Rename')}
          onClick={onEditCanvasName}
          disabled={activeCanvas === undefined}
          size="small"
          style={{ marginLeft: 8 }}
          type="ghost"
        />
      )}
    </StyledCanvasTitle>
  );
};

const StyledCanvasTitle = styled(Heading)<{ $isEditable: boolean }>`
  && {
    padding: ${({ $isEditable }) => ($isEditable ? '0' : '0 8px')};
    margin-left: 8px;
  }
`;
