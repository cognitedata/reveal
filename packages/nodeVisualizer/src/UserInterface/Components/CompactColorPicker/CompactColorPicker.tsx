import React, { useState } from 'react';
import { ColorResult, CompactPicker } from 'react-color';
import Color from 'color';
import styled from 'styled-components';
import { applicationDefaultFontSize } from '@/UserInterface/styles/styled.props';

interface CompactColorPickerProps {
  value: string;
  onChange: (id: string, value: Color) => void;
  id: string;
}

export const CompactColorPicker = (props: CompactColorPickerProps) => {
  const { value: color, id } = props;
  const [visible, setVisibility] = useState(false);

  const handleClose = () => {
    setVisibility(false);
  };

  return (
    <ColorPickerWrapper>
      <ColorDisplay onClick={() => setVisibility(!visible)}>
        <ColorBox color={color} />
        <ColorName>{color}</ColorName>
      </ColorDisplay>
      {visible && (
        <ColorPicker>
          <ColorPickerCover onClick={handleClose} />
          <CompactPicker
            color={color}
            onChangeComplete={(reactColor: ColorResult) => {
              props.onChange(
                id,
                Color({
                  r: reactColor.rgb.r,
                  g: reactColor.rgb.g,
                  b: reactColor.rgb.b,
                })
              );
            }}
          />
        </ColorPicker>
      )}
    </ColorPickerWrapper>
  );
};

const ColorPickerWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const ColorDisplay = styled.div`
  height: 1.3rem;
  border-radius: 4px;
  border: 1px solid #94949f;
  font-size: ${applicationDefaultFontSize};
  padding: 18px 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  background-color: white;
  box-sizing: border-box;
`;

const ColorBox = styled.span`
  width: 14px;
  height: 14px;
  border: 1px #c4c4c4 solid;
  background-color: ${(props) => props.color};
`;
const ColorName = styled.span`
  margin-left: 0.1rem;
`;
const ColorPicker = styled.div`
  position: fixed;
  z-index: 999;
`;
const ColorPickerCover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;
