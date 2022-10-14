import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
} from '@cognite/annotations';

export interface ProposedCogniteAnnotation extends PendingCogniteAnnotation {
  id: string;
}
export type CommonLegacyCogniteAnnotation =
  | CogniteAnnotation
  | ProposedCogniteAnnotation;

export type DownloadFileFunction = (
  fileName: string,
  drawText?: boolean,
  drawBox?: boolean,
  drawCustom?: boolean,
  immediateDownload?: boolean
) => Promise<any>;

export type ViewerZoomFunction = () => void;
export type ViewerZoomControlledFunction = (
  annotation: CogniteAnnotation,
  scale?: number
) => void;

export type ExtractFromCanvasFunction = (
  x: number,
  y: number,
  width: number,
  height: number
) => string | undefined;
