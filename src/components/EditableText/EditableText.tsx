import { useState, useEffect } from 'react';
import * as React from 'react';
import styled from 'styled-components';
import { Button, Icon, Input, Tooltip } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import ClickBoundary from './ClickBoundary';

export interface EditableTextProps {
  value: string;
  focus?: boolean;
  editing?: boolean;
  isError?: boolean;
  hideEdit?: boolean;
  hideButtons?: boolean;
  translations?: typeof defaultTranslations;
  placeholder?: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
}

export const defaultTranslations = makeDefaultTranslations(
  'Ok',
  'Cancel',
  'Rename'
);

const EditableText = ({
  isError = false,
  value,
  onChange,
  onCancel,
  editing,
  hideButtons,
  hideEdit,
  translations,
  placeholder,
  focus,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value);
  const t = { ...defaultTranslations, ...translations };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const finishEditing = () => {
    onChange(inputValue);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const startEditing = () => {
    setInputValue(value);
    setIsEditing(true);
  };

  const finishOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      if (onCancel) onCancel();
    }
  };

  if (editing || isEditing) {
    return (
      <ClickBoundary>
        <EditingWrapper>
          <div>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={finishOnEnter}
              onBlur={hideButtons ? finishEditing : undefined}
              placeholder={placeholder}
              autoFocus={focus}
              fullWidth
            />
          </div>
          {!hideButtons && (
            <>
              <Button
                type="primary"
                onClick={finishEditing}
                style={{ marginLeft: 8 }}
              >
                {t.Ok}
              </Button>
              <Button onClick={cancelEditing} style={{ marginLeft: 8 }}>
                {t.Cancel}
              </Button>
            </>
          )}
        </EditingWrapper>
      </ClickBoundary>
    );
  }
  return (
    <Wrapper>
      <div
        style={{
          color: isError ? 'var(--cogs-red)' : 'var(--cogs-text-color)',
          whiteSpace: 'nowrap',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      {!hideEdit && (
        <div className="edit-button" style={{ marginLeft: 4 }}>
          <ClickBoundary>
            <Tooltip content={t.Rename}>
              <Button
                type="ghost"
                onClick={startEditing}
                style={{ minWidth: '2.625rem' }}
              >
                <Icon type="Edit" />
              </Button>
            </Tooltip>
          </ClickBoundary>
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  & > .edit-button {
    visibility: hidden;
  }
  &:hover > .edit-button {
    visibility: visible;
  }
`;

const EditingWrapper = styled.div`
  display: flex;
  align-items: center;
`;

EditableText.translationKeys = Object.keys(defaultTranslations);

export default EditableText;
