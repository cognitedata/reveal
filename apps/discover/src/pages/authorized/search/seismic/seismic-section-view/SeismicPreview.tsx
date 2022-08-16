import React, { useState, useEffect, useMemo } from 'react';

import { Loader } from '@cognite/cogs.js';
import { Trace } from '@cognite/seismic-sdk-js';

import SeismicImage from './SeismicImage';
import { SeismicDisplayType, SliceData, Tuplet, XAxisData } from './types';
import { traceToRGB } from './utils';

interface Props {
  isLoading?: boolean;
  disableZoom?: boolean;
  colorScale: string;
  colorScaleRange?: Tuplet;
  slice?: SliceData;
  zoomLevel?: number;
  cursorMode?: string;
  displayType: SeismicDisplayType;
  onZoomLevelChange?: (value: number) => void;
}

export const SeismicPreview: React.FC<Props> = (props) => {
  const {
    isLoading,
    slice,
    colorScale,
    colorScaleRange = [0, 100],
    disableZoom,
    zoomLevel = 1,
    cursorMode,
    displayType,
    onZoomLevelChange,
  } = props;
  const [image, setpreviewImage] = useState<{
    array: Uint8ClampedArray;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (slice) {
      const height = slice.content[0].traceList.length;
      const width = slice.content.length;
      const buffer = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const values = traceToRGB(
            slice.content[x].traceList[y],
            slice.mean,
            slice.standardDeviation,
            colorScale,
            colorScaleRange
          );
          const pos = (y * width + x) * 4; // position in buffer based on x and y
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
  }, [slice, colorScale, colorScaleRange]);

  // Populate x axis data
  const { horizontalRange, horizontalRangeType } = useMemo(() => {
    const horizontalRange: XAxisData[] = (slice?.content || []).map(
      (row: Trace, index: number) => ({
        index,
        left: 0,
        value:
          (displayType.id === 'iline' ? row.xline?.value : row.iline?.value) ||
          0,
        x: row.coordinate?.x || 0,
        y: row.coordinate?.y || 0,
        traceList: row.traceList,
      })
    );
    const horizontalRangeType = displayType.id === 'iline' ? 'XL' : 'IL';
    return { horizontalRange, horizontalRangeType };
  }, [slice, displayType]);

  if (isLoading) {
    return <Loader darkMode={false} />;
  }

  if (!slice || !image) {
    return <div />;
  }

  return (
    <SeismicImage
      data={image.array}
      width={image.width}
      height={image.height}
      disableZoom={disableZoom}
      zoomLevel={zoomLevel}
      cursorMode={cursorMode}
      horizontalRange={horizontalRange}
      horizontalRangeType={horizontalRangeType}
      onZoomLevelChange={onZoomLevelChange}
    />
  );
};

export default SeismicPreview;
