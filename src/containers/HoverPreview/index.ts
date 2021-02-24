export * from './AssetHoverPreview';
export * from './FileHoverPreview';
export * from './TimeseriesHoverPreview';
export * from './SequenceHoverPreview';

export type RenderResourceActionsFunction = (props: {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
}) => React.ReactNode[];
