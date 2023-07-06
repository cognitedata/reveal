import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js-v9';

interface HighlightMatchProps {
  text: string;
  searchString?: string;
  highlightColor?: string;
}

function HighlightMatch({
  text,
  searchString,
  highlightColor = Colors['decorative--yellow--300'],
}: HighlightMatchProps) {
  if (!searchString) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchString})`, 'gi'));

  return (
    <>
      {parts.map((part) => (
        <HighlightText
          highlightColor={highlightColor}
          isHighlighted={part.toLowerCase() === searchString.toLowerCase()}
          key={Math.random()}
        >
          {part}
        </HighlightText>
      ))}
    </>
  );
}

const HighlightText = styled.span<{
  isHighlighted: boolean;
  highlightColor: string;
}>`
  background-color: ${(props) =>
    props.isHighlighted ? props.highlightColor : 'inherit'};
`;

export default HighlightMatch;
