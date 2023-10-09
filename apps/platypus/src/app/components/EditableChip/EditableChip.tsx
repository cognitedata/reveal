import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';

import styled from 'styled-components';

import { Button, Icon, Input, Tooltip } from '@cognite/cogs.js';

import { HtmlElementProps } from '../../types';

export interface EditableChipProps
  extends Omit<HtmlElementProps<HTMLDivElement>, 'onChange'> {
  className?: string;
  errorMessage?: string;
  isLocked?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  validate?: (value: string) => boolean;
  value?: string;
}

export const EditableChip = ({
  errorMessage,
  isLocked,
  label,
  onChange,
  placeholder,
  tooltip,
  validate,
  value,
  ...rest
}: EditableChipProps) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInternalValue(event.target.value);

    if (validate) {
      setIsValid(validate(event.target.value));
    }
  };

  const handleEditClick = () => {
    setIsInEditMode(true);
    setInternalValue(value || '');
  };

  const handleKeyDown: KeyboardEventHandler = (event) => {
    switch (event.code) {
      case 'Escape':
        setIsInEditMode(false);
        setIsValid(true);
        break;
      case 'Enter':
        submit();
        break;
      default:
        break;
    }

    event.stopPropagation();
  };

  const submit = () => {
    if (!isValid) {
      return;
    }

    setIsInEditMode(false);

    if (internalValue && internalValue !== value && isValid) {
      onChange!(internalValue);
    }
  };

  useEffect(() => {
    // we can't do this in the handleEditClick method because setting state isn't
    // synchronous and the input isn't rendered yet
    inputRef.current?.focus();
  }, [isInEditMode]);

  return (
    <div {...rest}>
      {isInEditMode ? (
        <StyledInput
          /*
          using autoFocus because Cogs Input loses focus when the error prop is updated
          */
          autoFocus
          aria-label={label}
          error={!isValid && errorMessage}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={submit}
          value={internalValue}
        />
      ) : (
        <Tooltip content={tooltip} disabled={!tooltip} placement="bottom">
          <Label isLocked={!!isLocked} isPlaceholder={!value}>
            <ValueWrapper>{value || placeholder}</ValueWrapper>
            {isLocked && <StyledIcon data-testid="icon-lock" type="Lock" />}
            {!isLocked && (
              <StyledButton
                icon="Edit"
                aria-label="Edit"
                onClick={handleEditClick}
              />
            )}
          </Label>
        </Tooltip>
      )}
    </div>
  );
};

const ValueWrapper = styled.span<{ isPlaceholder?: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${(props) =>
    props.placeholder
      ? 'var(--cogs-text-icon--muted)'
      : 'var(--cogs-text-icon--medium)'};
`;

const Label = styled.div<{ isPlaceholder?: boolean; isLocked: boolean }>`
  align-items: center;
  background: var(--cogs-surface--status-undefined--muted--hover);
  border-radius: 6px;
  display: inline-flex;
  opacity: ${(props) => (props.isPlaceholder ? 0.5 : 1)};
  color: ${(props) =>
    props.isPlaceholder
      ? 'var(--cogs-text-icon--muted)'
      : 'var(--cogs-text-icon--medium)'};
  background: ${(props) =>
    props.isPlaceholder
      ? 'var(--cogs-surface--status-undefined--muted--hover)'
      : 'var(--cogs-surface--status-undefined--muted--default)'};
  height: 36px;
  margin: 0;
  max-width: 100%;
  padding-left: 12px;
  padding-right: ${(props) => (!props.isLocked ? '0' : '12px')};
`;

const StyledIcon = styled(Icon)`
  color: var(--cogs-text-icon--muted);
  flex-shrink: 0;
  margin: 0 0 0 16px;
  opacity: 0.5;
`;

const StyledInput = styled(Input)`
  height: 36px;
`;

const StyledButton = styled(Button)`
  && {
    background-color: transparent;
    border-radius: 0 6px 6px 0;
    height: 100%;
    margin: 0 0 0 4px;

    &:hover {
      background-color: var(--cogs-surface--interactive--hover);
    }
  }
`;
