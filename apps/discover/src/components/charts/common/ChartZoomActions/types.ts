export interface ChartZoomActionsProps {
  zoomOut: () => void;
  zoomIn: () => void;
  disableZoomOut: boolean;
  disableZoomIn: boolean;
  resetZoom: () => void;
}
