/* eslint-disable @cognite/no-number-z-index */
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import styled from 'styled-components';

export const ColorPicker = ({
  size = '16px',
  color,
  onChange,
}: {
  size?: string;
  color: string;
  onChange: (newColor: string) => void;
}) => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  const handleChange = (newColor: any) => {
    onChange(newColor.hex);
  };

  return (
    <div>
      <ColorBoxContainer>
        <ColorBox
          size={size}
          color={color}
          onClick={() => {
            setDisplayColorPicker(true);
          }}
        />
      </ColorBoxContainer>
      {displayColorPicker ? (
        <Popover>
          <ColorPickerCover
            onClick={() => {
              setDisplayColorPicker(false);
            }}
          />
          <SketchPicker disableAlpha color={color} onChange={handleChange} />
        </Popover>
      ) : null}
    </div>
  );
};

const ColorBox = styled.div<{ size: string; color: string }>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-radius: 2px;
  background: ${(props) => props.color};
  cursor: pointer;
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const ColorPickerCover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const ColorBoxContainer = styled.div`
  border: 1px black solid;
  padding: 2px;
  border-radius: 4px;
`;
