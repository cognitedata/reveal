import React from 'react';

import styled from 'styled-components/macro';
import { v4 as generateId } from 'uuid';

import { Colors } from '@cognite/cogs.js';

interface TextHighlighterProps {
  text?: string;
  searchString?: string;
  highlightColor?: string;
  disableBold?: boolean;
}
function TextHighlighter({
  text,
  highlightColor = Colors['yellow-4'].alpha(0.4).toString(),
  searchString,
  disableBold,
}: TextHighlighterProps) {
  if (!text) {
    return null;
  }
  if (!searchString) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${searchString})`, 'gi'));
  return (
    <>
      {parts.map((part) => (
        <HighlightText
          disableBold={!!disableBold}
          highlightColor={highlightColor}
          isHighlighted={part.toLowerCase() === searchString.toLowerCase()}
          key={generateId()}
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
  disableBold: boolean;
}>`
  background-color: ${(props) =>
    props.isHighlighted ? props.highlightColor : 'inherit'};
  font-weight: ${(props) =>
    !props.disableBold && props.isHighlighted ? 'bold' : 'inherit'};
`;
export default TextHighlighter;
