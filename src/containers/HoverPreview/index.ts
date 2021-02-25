export * from './AssetHoverPreview';
export * from './FileHoverPreview';

export type RenderResourceActionsFunction = (props: {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
}) => React.ReactNode[];
