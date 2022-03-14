import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';

interface HighlightMatchProps {
  text: string;
  searchString?: string;
  highlightColor?: string;
}

function HighlightMatch({
  text,
  searchString,
  highlightColor = Colors['yellow-4'].alpha(0.4).toString(),
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
