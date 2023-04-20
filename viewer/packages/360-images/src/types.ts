/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel } from '@cognite/sdk';
import { Image360 } from './entity/Image360';
import { Image360Revision } from './entity/Image360Revision';

/**
 * Delegate for 360 image mode entered events.
 */
export type Image360EnteredDelegate = (image360: Image360, revision: Image360Revision) => void;

/**
 * Delegate for 360 image mode exited events.
 */
export type Image360ExitedDelegate = () => void;

/**
 * Delegate for 360 image annotation hover events
 */
export type Image360AnnotationHoveredDelegate = (annotation: AnnotationModel) => void;

/**
 * General state keeping track of how annotations are visualized
 */
export type ImageAnnotationVisualizationState = {
  visible: boolean;
};
