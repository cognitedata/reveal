import { Button, Icon, Input } from '@cognite/cogs.js';
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

export type EditableChipProps = {
  className?: string;
  isLocked?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export const EditableChip = (props: EditableChipProps) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.target.value);
  };

  const handleEditClick = () => {
    setIsInEditMode(true);
    setValue(props.value || '');
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

    if (value && value !== props.value) {
      props.onChange(value);
    }
  };

  useEffect(() => {
    // we can't do this in the handleEditClick method because setting state isn't
    // synchronous and the input isn't rendered yet
    inputRef.current?.focus();
  }, [isInEditMode]);

  return isInEditMode ? (
    <StyledInput
      className={props.className}
      ref={inputRef}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={submit}
      value={value}
    />
  ) : (
    <Label
      className={props.className}
      hasValue={!!props.value}
      isLocked={!!props.isLocked}
    >
      {props.value || props.placeholder}
      {props.isLocked && <StyledIcon data-testid="icon-lock" type="Lock" />}
      {!props.isLocked && props.value && (
        <StyledButton icon="Edit" aria-label="Edit" onClick={handleEditClick} />
      )}
    </Label>
  );
};

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
  opacity: ${(props) => (props.hasValue ? 1 : 0.5)};
  padding-left: 12px;
  padding-right: ${(props) =>
    props.hasValue && !props.isLocked ? '0' : '12px'};
`;

const StyledIcon = styled(Icon)`
  color: var(--cogs-text-icon--muted);
  margin: 0 0 0 16px;
  opacity: 0.5;
`;

const StyledInput = styled(Input)`
  height: 36px;
`;

const StyledButton = styled(Button)`
  background-color: transparent;
  border-radius: 0 6px 6px 0;
  height: 100%;
  margin: 0 0 0 4px;

  &:hover {
    background-color: var(--cogs-surface--interactive--hover);
  }
`;
