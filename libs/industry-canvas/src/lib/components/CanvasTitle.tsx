import { Button, Input, Title, Tooltip } from '@cognite/cogs.js';
import {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { DEFAULT_CANVAS_NAME } from '../services/IndustryCanvasService';

type CanvasTitleProps = Pick<
  IndustryCanvasContextType,
  'activeCanvas' | 'saveCanvas'
> & {
  isEditingTitle: boolean;
  setIsEditingTitle: Dispatch<SetStateAction<boolean>>;
};

export const CanvasTitle: React.FC<CanvasTitleProps> = ({
  activeCanvas,
  saveCanvas,
  isEditingTitle,
  setIsEditingTitle,
}) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [name, setName] = useState(activeCanvas?.name ?? DEFAULT_CANVAS_NAME);

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

  return (
    <StyledCanvasTitle
      isEditable={isEditingTitle}
      level={3}
      onClick={() => setIsEditingTitle(true)}
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
        <Tooltip content="Rename" placement="bottom">
          <span>{name}</span>
        </Tooltip>
      )}
      {activeCanvas !== undefined && isEditingTitle && (
        <Button
          icon="Checkmark"
          aria-label="edit-canvas-name"
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

const StyledCanvasTitle = styled(Title)<{ isEditable: boolean }>`
  padding: ${({ isEditable }) => (isEditable ? '0' : '0 8px')};
`;
