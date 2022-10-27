import { Button, Icon, Input } from '@cognite/cogs.js';
import { HtmlElementProps } from '@platypus-app/types';
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

export interface EditableChipProps
  extends Omit<HtmlElementProps<HTMLDivElement>, 'onChange'> {
  className?: string;
  isLocked?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
}

export const EditableChip = ({
  isLocked,
  label,
  onChange,
  placeholder,
  value,
  ...rest
}: EditableChipProps) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setInternalValue(event.target.value);
  };

  const handleEditClick = () => {
    setIsInEditMode(true);
    setInternalValue(value || '');
  };

  const handleKeyDown: KeyboardEventHandler = (event) => {
    switch (event.code) {
      case 'Escape':
        setIsInEditMode(false);
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
    setIsInEditMode(false);

    if (internalValue && internalValue !== value) {
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
          aria-label={label}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={submit}
          value={internalValue}
        />
      ) : (
        <Label hasValue={!!value} isLocked={!!isLocked}>
          <ValueWrapper>{value || placeholder}</ValueWrapper>
          {isLocked && <StyledIcon data-testid="icon-lock" type="Lock" />}
          {!isLocked && value && (
            <StyledButton
              icon="Edit"
              aria-label="Edit"
              onClick={handleEditClick}
            />
          )}
        </Label>
      )}
    </div>
  );
};

const ValueWrapper = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Label = styled.div<{ hasValue: boolean; isLocked: boolean }>`
  align-items: center;
  background: ${(props) =>
    props.hasValue
      ? 'var(--cogs-surface--status-undefined--muted--hover)'
      : 'var(--cogs-surface--status-undefined--muted--default)'};
  border-radius: 6px;
  color: ${(props) =>
    props.hasValue
      ? 'var(--cogs-text-icon--medium)'
      : 'var(--cogs-text-icon--muted)'};
  display: inline-flex;
  height: 36px;
  margin: 0;
  max-width: 100%;
  opacity: ${(props) => (props.hasValue ? 1 : 0.5)};
  padding-left: 12px;
  padding-right: ${(props) =>
    props.hasValue && !props.isLocked ? '0' : '12px'};
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
