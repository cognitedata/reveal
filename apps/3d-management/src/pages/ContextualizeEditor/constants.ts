import { Color } from 'three';

import { DefaultNodeAppearance, NodeOutlineColor } from '@cognite/reveal';
import { QualitySettings } from '@cognite/reveal-react-components';

export const CAD_EDITOR_METRIC_PREFIX = '3D.CEditor.CAD';
export const POINT_CLOUD_EDITOR_METRIC_PREFIX = '3D.CEditor.PC';

export const CONTEXTUALIZE_EDITOR_HEADER_HEIGHT = 45;
export const FLOATING_ELEMENT_MARGIN = 15;
export const DEFAULT_RIGHT_SIDE_PANEL_WIDTH = 500;

export const defaultRevealColor = new Color(0x4a4a4b);

export const DEFAULT_POINT_BUDGET = 3_000_000;
export const DEFAULT_CAD_BUDGET = 10_000_000;

export const DEFAULT_POINT_SIZE = 2;
export const MIN_POINT_SIZE = 0.0;
export const MAX_POINT_SIZE = 4; // Default seems be be 2, but the user probably wants lower values
export const STEP_POINT_SIZE = 0.1;

export const ANNOTATION_CONTEXTUALIZED_COLOR = 0xd46ae2; // magenta
export const ANNOTATION_SUGGESTED_COLOR = 0xffff00; // yellow
export const ANNOTATION_APPROVED_COLOR = 0x00ff00; // green
export const ANNOTATION_REJECTED_COLOR = 0xff0000; // red
export const ANNOTATION_HIGHLIGHTED_COLOR = 0xffff00; // yellow
export const ANNOTATION_LINE_WIDTH = 3;
export const ANNOTATION_SELECTED_LINE_WIDTH = 10;
export const ANNOTATION_CYLINDER_RADIUS_MARGIN = 0.2; // 20 % percent extra margin on the cylinder radius

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export const LOW_QUALITY_SETTINGS: QualitySettings = {
  cadBudget: {
    maximumRenderCost: DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: 1.4e6,
    movingCameraResolutionFactor: 1,
  },
};

export const HIGH_QUALITY_SETTINGS: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 2 * DEFAULT_CAD_BUDGET,
    highDetailProximityThreshold: 100,
  },
  pointCloudBudget: {
    numberOfPoints: 3 * DEFAULT_POINT_BUDGET,
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
  },
};

export const CAD_STYLE = {
  SELECTED: DefaultNodeAppearance.Highlighted,
  CONTEXTUALIZED_COLOR: {
    color: new Color(ANNOTATION_CONTEXTUALIZED_COLOR),
    outlineColor: NodeOutlineColor.NoOutline,
  },
  HIGHLIGHTED: {
    color: new Color(ANNOTATION_HIGHLIGHTED_COLOR),
    outlineColor: NodeOutlineColor.White,
  },
};
