import { useEffect, useState } from 'react';
import { Button, Tooltip, Input } from '@cognite/cogs.js';

import { Container } from './elements';

type Props = {
  name: string;
  onSaveChange: (newName: string) => boolean;
};

const EditableName = ({ name, onSaveChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(name);
  useEffect(() => {
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setText(name);
  }, [name]);

  function onSave() {
    if (text !== name) {
      // Change has been made, call callback prop
      const successfullSave = onSaveChange(text);
      if (successfullSave) {
        setIsOpen(false);
      }
    }
  }

  function onCancel() {
    setIsOpen(false);
    setText(name);
  }

  function upHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.code === 'Escape') {
      onCancel();
    }
  }

  if (isOpen) {
    return (
      <Container>
        <Input
          aria-label="editText"
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {text !== name && (
          <Button
            size="small"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            Save
          </Button>
        )}
        <Button
          size="small"
          type="tertiary"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          Cancel
        </Button>
      </Container>
    );
  }
  return (
    <Container>
      {text.length > 20 ? (
        <span className="name-wrapper">
          <Tooltip content={text}>
            <span>{`${text.substring(0, 20)}...`}</span>
          </Tooltip>
        </span>
      ) : (
        <span className="name-wrapper">{text}</span>
      )}
      <Button
        className="pencil-button"
        size="small"
        unstyled
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        icon="Edit"
        aria-label="Edit"
      />
    </Container>
  );
};

export default EditableName;
