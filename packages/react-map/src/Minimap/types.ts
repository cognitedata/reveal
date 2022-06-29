export interface Options {
  id?: string;
  width?: string;
  height?: string;
  style?: string;
  center?: [number, number];
  zoom?: number;

  // should be a function; will be bound to Minimap
  zoomAdjust?: () => void;

  maxBounds?: 'parent';
  bounds?: [number, number];
  zoomOffset?: number; // The zoom offset between the minimap and the parentmap
  lineColor?: string; // Hex color
  lineWidth?: number;
  lineOpacity?: number;

  fillColor?: string;
  fillOpacity?: number;

  interactions: Interactions;
}

export interface Interactions {
  dragPan?: boolean;
  scrollZoom?: boolean;
  boxZoom?: boolean;
  dragRotate?: boolean;
  keyboard?: boolean;
  doubleClickZoom?: boolean;
  touchZoomRotate?: boolean;
}
