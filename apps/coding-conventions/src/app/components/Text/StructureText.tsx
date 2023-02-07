import styled from 'styled-components';
import { Convention } from '../../types';
import { colors } from '../../utils/colors';
import { SelectedText } from '../../containers/convention/elements';

interface Props {
  text: string;
  editMode?: boolean;
  conventions: Convention[];
  onClick?: (id: string) => void;
}
export const StructureText: React.FC<Props> = ({
  conventions,
  editMode,
  text,
  onClick,
}) => {
  if (editMode || conventions.length === 0) {
    return <Text>{text}</Text>;
  }

  const content: JSX.Element[] = [];

  for (let i = 0; i < text.length; i++) {
    const selection = conventions.find((item) => {
      return item.start === i;
    });

    if (selection) {
      content.push(
        <SelectedText
          $color={colors[selection.start]}
          onClick={() => {
            onClick?.(selection.id);
          }}
          key={`${selection.start}-${selection.end}`}
        >
          {selection.keyword}
        </SelectedText>
      );
      i = selection.end - 1;
    } else {
      content.push(<Text key={i}>{text.charAt(i)}</Text>);
    }
  }

  return <>{content}</>;
};

export const Text = styled.div`
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  display: inline-block;
  white-space: pre;
`;
