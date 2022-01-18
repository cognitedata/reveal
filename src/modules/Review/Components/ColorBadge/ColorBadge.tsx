import React from 'react';
import styled from 'styled-components';

export const ColorBadge = ({ color }: { color: string }) => {
  return (
    <ColorBoxContainer>
      <ColorBox color={color} />
    </ColorBoxContainer>
  );
};

const ColorBoxContainer = styled.div`
  border: 1px solid black;
  border-radius: 5px;
  width: 50px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type ColorProps = { color: string };
const ColorBox = styled.div<ColorProps>`
  background-color: ${(props) => props.color};
  overflow: hidden;
  width: 40px;
  height: 26px;
`;
