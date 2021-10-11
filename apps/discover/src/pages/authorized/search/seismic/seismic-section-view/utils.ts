import isUndefined from 'lodash/isUndefined';

import { seismicService } from 'modules/seismicSearch/service';
import { SurveyFile } from 'modules/seismicSearch/types';

import { Tuplet, LineRange } from './types';

// This returns boundary range if multiple slices selected with difference ranges
export const getBoundryRange = (ranges: LineRange[]) => {
  const iline: {
    min?: number;
    max?: number;
  } = {};
  const xline: {
    min?: number;
    max?: number;
  } = {};
  ranges.forEach((range) => {
    if (
      !isUndefined(range.iline.min) &&
      (isUndefined(iline.min) || iline.min > range.iline.min)
    ) {
      iline.min = range.iline.min;
    }
    if (
      !isUndefined(range.iline.max) &&
      (isUndefined(iline.max) || iline.max < range.iline.max)
    ) {
      iline.max = range.iline.max;
    }
    if (
      !isUndefined(range.xline.min) &&
      (isUndefined(xline.min) || xline.min > range.xline.min)
    ) {
      xline.min = range.xline.min;
    }
    if (
      !isUndefined(range.xline.max) &&
      (isUndefined(xline.max) || xline.max < range.xline.max)
    ) {
      xline.max = range.xline.max;
    }
  });

  return {
    id: 'boundry',
    iline,
    xline,
  };
};

// Get slice range informations
export const getRangeMap = async (datasets: SurveyFile[]) => {
  const ranges = await Promise.all(
    datasets.map((dataset) => seismicService.getVolumeRange(dataset.fileId))
  );
  const rangeMap = ranges.reduce(
    (prev, cur) => ({ ...prev, [cur.id]: cur }),
    {}
  );
  return rangeMap;
};

// Get canvas top right position difference on zooming
export const getDiffOnZoom = (size: Tuplet, zoomLevel: number): Tuplet => {
  const x = (-1 * size[0] * (zoomLevel - 1)) / (2 * zoomLevel);
  const y = (-1 * size[1] * (zoomLevel - 1)) / (2 * zoomLevel);
  return [x, y];
};

// This returns valid top left position of canvas on zooming
export const getValidDiffOnZoom = (
  diff: Tuplet,
  oldDiff: Tuplet,
  size: Tuplet,
  zoomLevel: number
): Tuplet => {
  const limitX = ((diff[0] * zoomLevel) / (zoomLevel - 1)) * -1;
  let newX = limitX > size[0] ? 2 * diff[0] - oldDiff[0] : diff[0];
  newX = newX > 0 ? 0 : newX;

  const limitY = ((diff[1] * zoomLevel) / (zoomLevel - 1)) * -1;
  let newY = limitY > size[1] ? 2 * diff[1] - oldDiff[1] : diff[1];
  newY = newY > 0 ? 0 : newY;
  return [newX, newY];
};

// This returns valid top left position of canvas on panning
export const getValidDiffOnPan = (
  diff: Tuplet,
  oldDiff: Tuplet,
  size: Tuplet,
  zoomLevel: number
): Tuplet => {
  let newX = diff[0] > 0 ? 0 : diff[0];
  const limitX = ((newX * zoomLevel) / (zoomLevel - 1)) * -1;
  newX = limitX > size[0] ? oldDiff[0] : newX;

  let newY = diff[1] > 0 ? 0 : diff[1];
  const limitY = ((newY * zoomLevel) / (zoomLevel - 1)) * -1;
  newY = limitY > size[1] ? oldDiff[1] : newY;

  return [newX, newY];
};

// Get canvas data as image
export const getCanvasImage = (
  width: number,
  height: number,
  data: Uint8ClampedArray
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const idata = ctx.createImageData(width, height);
    idata.data.set(data);
    ctx.putImageData(idata, 0, 0);
  }
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

// Get RGBA value in red to black scale
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

// Get RGBA value in red to blue scale
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

// Get RGBA value in grayscale
const getGreyScaleValue = (value: number) => {
  const buffer = [];
  const v = (value + 255) / 2;
  buffer.push(v); // R value [0, 255]
  buffer.push(v); // G value
  buffer.push(v); // B value
  buffer.push(255); // set alpha channel
  return buffer;
};

// Convert trace point to rgba value
export const traceToRGB = (
  v: number,
  mean: number,
  std: number,
  colorScale: string,
  colorScaleRange: Tuplet
) => {
  let value = v - mean; // centers the data 'around' 0
  value = (value / std) * 255; //  array / std(array) * 255 //  this creates a standard deviation of 255 (range between +/- 1 std will be 510)
  value = value < -255 ? -255 : value; // array[array < -255] = -255
  value = value > 255 ? 255 : value; // array[array > 255] = 255

  // Set color limts based on selected color scale
  const leftLimit = ((50 - colorScaleRange[0]) / 50) * 255;
  const rightLimit = ((colorScaleRange[1] - 50) / 50) * 255;

  if (value >= leftLimit) {
    value = 255;
  }
  if (value <= -rightLimit) {
    value = -255;
  }

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

// Get mean from number list
export const getMean = (numbers: number[]) => {
  return numbers.length > 0
    ? numbers.reduce((a: number, b: number) => a + b) / numbers.length
    : 0;
};

// Get standard deviation from number list
export const getStandardDeviation = (numbers: number[], mean: number) => {
  return Math.sqrt(
    numbers
      .map((x: number) => (x - mean) ** 2)
      .reduce((a: number, b: number) => a + b) / numbers.length
  );
};
