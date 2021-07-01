import { Asset, FileInfo } from '@cognite/sdk';
import { Vertices } from 'modules/types';

export const verticesToBoundingBox = (
  vertices: Vertices
): { xMin: number; yMin: number; xMax: number; yMax: number } => {
  let xMin = 0;
  let yMin = 0;
  let yMax = 0;
  let xMax = 0;
  // if it is a rectangle
  if (vertices.length === 4) {
    xMin = vertices[0].x;
    yMin = vertices[0].y;
    xMax = vertices[2].x;
    yMax = vertices[2].y;
  }
  return { xMin, yMin, xMax, yMax };
};

export const mapAssetsToEntities = (
  assets?: Asset[],
  fieldToMatch: keyof Asset = 'name'
) => {
  return (assets ?? []).map((asset) => ({
    resourceType: 'asset',
    name: asset[fieldToMatch] ?? asset.name, // temporary solution - mapping fields chosen by user to name
  }));
};

export const mapFilesToEntities = (
  files?: FileInfo[],
  fieldToMatch: keyof FileInfo = 'name'
) => {
  return (files ?? []).map((file) => ({
    resourceType: 'file',
    name: file[fieldToMatch] ?? file.name, // temporary solution - mapping fields chosen by user to name
  }));
};
