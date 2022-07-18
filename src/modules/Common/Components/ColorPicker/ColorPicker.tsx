/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect, useRef, useState } from 'react';
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
  const colorBoxElm = useRef<HTMLDivElement | null>(null);
  const colorPicker = useRef<HTMLDivElement | null>(null);

  const handleChange = (newColor: any) => {
    onChange(newColor.hex);
  };

  useEffect(() => {
    if (displayColorPicker) {
      if (colorBoxElm.current && colorPicker.current) {
        const pos = (
          colorBoxElm.current as HTMLDivElement
        ).getBoundingClientRect();
        colorPicker.current.style.top = `${pos.top + 30}px`;
        colorPicker.current.style.left = `${pos.left}px`;
      }
    }
  }, [displayColorPicker]);

  return (
    <div>
      <ColorBoxContainer>
        <ColorBox
          ref={colorBoxElm}
          size={size}
          color={color}
          onClick={() => {
            setDisplayColorPicker(true);
          }}
        />
      </ColorBoxContainer>
      {displayColorPicker ? (
        <Popover ref={colorPicker}>
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
  position: fixed;
  z-index: 2;
  cursor: pointer;
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
