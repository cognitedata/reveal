import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

import styled from 'styled-components';

import { Input, InputProps } from '@cognite/cogs.js';

type AutoSizingInputProps = {
  minWidth?: number;
} & InputProps;

const DEFAULT_MIN_WIDTH = 200;

const AutoSizingInput = forwardRef<
  HTMLInputElement | null,
  AutoSizingInputProps
>(({ minWidth = DEFAULT_MIN_WIDTH, ...props }, ref) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  useImperativeHandle(
    ref,
    () => {
      return inputRef as HTMLInputElement;
    },
    [inputRef]
  );

  const computedWidth = useMemo(() => {
    if (canvasRef === null || inputRef === null || props.value === undefined) {
      return 0;
    }

    if (inputRef === null) {
      return 0;
    }

    const context = canvasRef.getContext('2d');
    if (context === null) {
      return 0;
    }

    const computedStyle = getComputedStyle(inputRef);

    const fontFamily = computedStyle.fontFamily;
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const fontStyle = computedStyle.fontStyle;

    context.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    return context.measureText(String(props.value)).width;
  }, [props.value, inputRef, canvasRef]);

  const clampedWidth = Math.max(computedWidth, minWidth);

  return (
    <Container>
      <MeasuringCanvas ref={setCanvasRef} />
      <Input
        {...props}
        ref={setInputRef}
        fullWidth
        style={{ width: `calc(${clampedWidth}px + 4ch)` }}
      />
    </Container>
  );
});

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  max-width: 100%;
`;

const MeasuringCanvas = styled.canvas`
  position: absolute;
  visibility: hidden;
  pointer-events: none;
`;

export default AutoSizingInput;
