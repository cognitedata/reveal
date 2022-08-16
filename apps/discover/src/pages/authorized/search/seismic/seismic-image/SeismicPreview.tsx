import React, { useState, useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import styled from 'styled-components/macro';

import { Slices } from 'modules/seismicSearch/types';

import { ColourButtonContainer } from './ColourButtonContainer';
import items from './SeismicColors';
import { SeismicImage } from './SeismicImage';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
`;

interface Props {
  disableZoom?: boolean;
  colorScale: string;
  slice: Slices;
}

export const SeismicImagePreviewImage: React.FC<Props> = (props) => {
  const { slice, colorScale, disableZoom } = props;
  const [image, setpreviewImage] = useState<{
    array: Uint8ClampedArray;
    width: number;
    height: number;
  } | null>(null);

  const getValue = (v: number, mean: number, std: number) => {
    let value = v - mean; // centers the data 'around' 0
    value = (value / std) * 255; //  array / std(array) * 255 //  this creates a standard deviation of 255 (range between +/- 1 std will be 510)
    value = value < -255 ? -255 : value; // array[array < -255] = -255
    value = value > 255 ? 255 : value; // array[array > 255] = 255
    return value;
  };

  const getRedBlackColorValue = (value: number) => {
    const buffer = [];
    if (value >= 0) {
      buffer.push(255); // R value [0, 255]
      buffer.push(255 - value); // G value
      buffer.push(255 - value); // B value
      buffer.push(255); // set alpha channel
    } else {
      buffer.push(255 + value); // R value [0, 255]
      buffer.push(255 + value); // G value
      buffer.push(255 + value); // B value
      buffer.push(255); // set alpha channel
    }
    return buffer;
  };

  const getRedBlueColorValue = (value: number) => {
    const buffer = [];
    if (value >= 0) {
      buffer.push(255); // R value [0, 255]
      buffer.push(255 - value); // G value
      buffer.push(255 - value); // B value
      buffer.push(255); // set alpha channel
    } else {
      buffer.push(255 + value); // R value [0, 255]
      buffer.push(255 + value); // G value
      buffer.push(255); // B value
      buffer.push(255); // set alpha channel
    }
    return buffer;
  };

  const getGreyScaleValue = (value: number) => {
    const buffer = [];
    const v = (value + 255) / 2;
    buffer.push(v); // R value [0, 255]
    buffer.push(v); // G value
    buffer.push(v); // B value
    buffer.push(255); // set alpha channel
    return buffer;
  };

  useEffect(() => {
    const getImageValue = (value: number) => {
      if (colorScale === 'greyscale') {
        return getGreyScaleValue(value);
      }
      if (colorScale === 'redBlack') {
        return getRedBlackColorValue(value);
      }
      if (colorScale === 'redBlue') {
        return getRedBlueColorValue(value);
      }

      return [];
    };

    if (slice && slice.data) {
      const height = slice.data.content[0].traceList.length;
      const width = slice.data.content.length;
      const buffer = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const value = getValue(
            slice.data.content[x].traceList[y],
            slice.data.mean,
            slice.data.standardDeviation
          );
          const pos = (y * width + x) * 4; // position in buffer based on x and y
          const values = getImageValue(value);
          // eslint-disable-next-line prefer-destructuring
          buffer[pos] = values[0]; // R value [0, 255]
          // eslint-disable-next-line prefer-destructuring
          buffer[pos + 1] = values[1]; // G value
          // eslint-disable-next-line prefer-destructuring
          buffer[pos + 2] = values[2]; // B value
          // eslint-disable-next-line prefer-destructuring
          buffer[pos + 3] = values[3]; // set alpha channel
        }
      }
      setpreviewImage({ array: buffer, width, height });
    }
  }, [slice, colorScale]);

  if (!image) {
    return <div />;
  }
  return (
    <SeismicImage
      data={image.array}
      width={image.width}
      height={image.height}
      disableZoom={disableZoom}
    />
  );
};

export const SeismicPreview = ({ slice }: { slice: Slices }) => {
  const [colorScale, setColorScale] = useState<string>(items[0].id);

  const imageWidth = slice && slice.data ? slice.data.content.length + 10 : 0;

  return (
    <>
      <ColourButtonContainer setColorScale={setColorScale} />
      <Container>
        {/*
          <div
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
          >
          <IconButton
          variant="contained"
          size="small"
          style={{ marginBottom: 8 }}
          >
          +
          </IconButton>
          <IconButton variant="contained" size="small">
          -
          </IconButton>
          </div>
        */}

        <div>
          <Scrollbars style={{ width: imageWidth }}>
            <SeismicImagePreviewImage slice={slice} colorScale={colorScale} />
          </Scrollbars>
        </div>
      </Container>
    </>
  );
};

export default SeismicPreview;
