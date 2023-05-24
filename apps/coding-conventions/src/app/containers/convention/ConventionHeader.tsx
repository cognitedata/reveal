import { Title } from '@cognite/cogs.js';
import React from 'react';
import { HintText } from '../../components/Info/HintText';
import { StructureText } from '../../components/Text/StructureText';
import { Convention } from '../../types';
import { Container } from './elements';

interface Props {
  editMode?: boolean;
  conventions: Convention[];
  structureText: string;
  onKeysChange: (keys: string[]) => void;
  onConventionCreate: (
    newConvention: Omit<Convention, 'id' | 'systemId'>
  ) => void;
}
export const ConventionHeader: React.FC<Props> = ({
  conventions,
  editMode,
  onKeysChange,
  onConventionCreate,
  structureText,
}) => {
  const handleSelectionChange = (newSelection: Selection | null) => {
    if (newSelection === null) return;

    const startOffset = newSelection.getRangeAt(0).startOffset;
    const endOffset = newSelection.getRangeAt(0).endOffset;

    if (
      startOffset === endOffset ||
      startOffset > endOffset ||
      startOffset > structureText.length ||
      newSelection.toString().includes(' ') ||
      newSelection.toString().includes('-')
    ) {
      alert('Invalid selection');
      return;
    }

    for (const { start, end } of conventions) {
      if (startOffset < end && start < endOffset) {
        throw new Error('Selection on these ranges have already been made.');
      }
    }

    onConventionCreate({
      keyword: newSelection.toString(),
      start: startOffset,
      end: endOffset,
    });
  };

  return (
    <Container>
      {editMode && (
        <HintText text="Mark/select the characters in the text below to create a new convention" />
      )}
      <Title
        onDoubleClick={() =>
          alert('Mark the text, double click is not supported')
        }
        onMouseUp={() => {
          if (editMode === false) {
            return;
          }

          try {
            const currentSelection = window.getSelection();
            handleSelectionChange(currentSelection);
          } catch (error: any) {
            alert(error.message);
          }
        }}
      >
        <StructureText
          text={structureText}
          conventions={conventions}
          editMode={editMode}
          onClick={(selectedId) => {
            onKeysChange([selectedId]);
          }}
        />
      </Title>
    </Container>
  );
};
