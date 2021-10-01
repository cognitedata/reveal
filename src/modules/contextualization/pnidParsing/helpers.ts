import { Asset, FileInfo } from '@cognite/sdk';
import { Vertices, BoundingBox } from 'modules/types';

export const verticesToBoundingBox = (vertices: Vertices): BoundingBox => {
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

export const boundingBoxToVertices = (boundingBox: BoundingBox): Vertices => {
  const { xMin, xMax, yMin, yMax } = boundingBox;
  const vertices: Vertices = [
    { x: xMin, y: yMin },
    { x: xMax, y: yMin },
    { x: xMax, y: yMax },
    { x: xMin, y: yMax },
  ];
  return vertices;
};

export const mapAssetsToEntities = (
  assets?: Asset[],
  fieldToMatch: keyof Asset = 'name',
  userDefinedField: string = 'userDefinedField'
) => {
  const isMetadata = fieldToMatch.includes('metadata');
  const metadataField: keyof Asset['metadata'] = (
    isMetadata ? fieldToMatch.replace('metadata.', '') : fieldToMatch
  ) as keyof Asset['metadata'];

  return (assets ?? []).map((asset) => ({
    resourceType: 'asset',
    id: asset.id,
    externalId: asset.externalId,
    [userDefinedField]: isMetadata
      ? (asset?.metadata ?? {})[metadataField] ?? ''
      : asset[fieldToMatch] ?? '',
  }));
};

export const mapFilesToEntities = (
  files?: FileInfo[],
  fieldToMatch: keyof FileInfo = 'name',
  userDefinedField: string = 'userDefinedField'
) => {
  const isMetadata = fieldToMatch.includes('metadata');
  const metadataField: keyof FileInfo['metadata'] = (
    isMetadata ? fieldToMatch.replace('metadata.', '') : fieldToMatch
  ) as keyof FileInfo['metadata'];

  return (files ?? []).map((file) => ({
    resourceType: 'file',
    id: file.id,
    externalId: file.externalId,
    [userDefinedField]: isMetadata
      ? (file?.metadata ?? {})[metadataField] ?? ''
      : file[fieldToMatch] ?? '',
  }));
};
