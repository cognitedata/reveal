import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Icon, Input, Tooltip } from '@cognite/cogs.js';
import ClickBoundary from './ClickBoundary';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
  editing?: boolean;
  hideButtons?: boolean;
  hideEdit?: boolean;
}

const EditableText = ({
  value,
  onChange,
  onCancel,
  editing,
  hideButtons,
  hideEdit,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value);

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
              autoFocus
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
                Ok
              </Button>
              <Button onClick={cancelEditing} style={{ marginLeft: 8 }}>
                Cancel
              </Button>
            </>
          )}
        </EditingWrapper>
      </ClickBoundary>
    );
  }
  return (
    <Wrapper>
      <div>{value}</div>
      {!hideEdit && (
        <div className="edit-button" style={{ marginLeft: 4 }}>
          <ClickBoundary>
            <Tooltip content="Rename">
              <Button type="ghost" onClick={startEditing}>
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

export default EditableText;
