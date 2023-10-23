import React, {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';

import styled from 'styled-components';

import { Button, Heading, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { DEFAULT_CANVAS_NAME } from '../services/IndustryCanvasService';

import AutoSizingInput from './AutoSizingInput/AutoSizingInput';

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

  if (isEditingTitle && activeCanvas !== undefined) {
    return (
      <EditableContainer>
        <AutoSizingInputContainer>
          <AutoSizingInput
            autoFocus
            minWidth={100}
            onChange={(e) => setName(e.target.value)}
            onBlur={onEditCanvasName}
            value={name}
            ref={(ref) => setInputRef(ref)}
          />
        </AutoSizingInputContainer>
        <Button
          icon="Checkmark"
          aria-label={t(translationKeys.COMMON_CANVAS_RENAME, 'Rename')}
          onClick={onEditCanvasName}
          disabled={activeCanvas === undefined}
          size="small"
          style={{ marginLeft: 8 }}
          type="ghost"
        />
      </EditableContainer>
    );
  }

  return (
    <StyledCanvasTitle
      $isEditable={isEditingTitle}
      level={5}
      onClick={onCanvasTitleClick}
    >
      <TitleContent>
        <Tooltip
          content={t(translationKeys.COMMON_CANVAS_RENAME, {
            defaultValue: 'Rename',
            title: name,
          })}
          placement="bottom-start"
        >
          <span>{name}</span>
        </Tooltip>
      </TitleContent>
    </StyledCanvasTitle>
  );
};

const TitleContent = styled.div`
  max-width: 100%;
  height: 1em;
  line-height: 1em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EditableContainer = styled.div`
  margin-left: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;

  // This is coming from Heading level 5, but we are not setting
  // the letter-spacing property as it's not measurable by the canvas comp.
  font-size: var(--cogs-h5-font-size);
  font-weight: 600;
`;

const AutoSizingInputContainer = styled.div`
  display: flex;
  flex-grow: 0;
  flex-shrink: 1;
  overflow: hidden;
`;

const StyledCanvasTitle = styled(Heading)<{ $isEditable: boolean }>`
  display: flex;
  flex-direction: row;
  padding: ${({ $isEditable }) => ($isEditable ? '0' : '0 8px')};
  margin-left: 8px;
  overflow: hidden;
  align-items: center;
`;
