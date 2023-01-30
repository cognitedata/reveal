import { Title, toast } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import { HintText } from '../../components/Info/HintText';
import { StructureText } from '../../components/Text/StructureText';
import { Convention } from '../../types';
import { Container } from './elements';

interface Props {
  editMode?: boolean;
  conventions: Convention[];
  structureText: string;
  onKeysChange: (keys: string[]) => void;
  onConventionCreate: (newConvention: Convention) => void;
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

    if (startOffset === endOffset) return;

    for (const { range } of conventions) {
      if (startOffset < range.end && range.start < endOffset) {
        throw new Error('Selection on these ranges have already been made.');
      }
    }

    onConventionCreate({
      id: uniqueId(),
      keyword: newSelection.toString(),
      range: {
        start: startOffset,
        end: endOffset,
      },
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
            toast.error(error.message, { position: 'bottom-center' });
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
