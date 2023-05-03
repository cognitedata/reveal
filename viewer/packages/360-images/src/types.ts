/*!
 * Copyright 2023 Cognite AS
 */

import { Image360 } from './entity/Image360';
import { Image360Revision } from './entity/Image360Revision';
import { Image360Annotation } from './annotation/Image360Annotation';
import { PointerEventData } from '@reveal/utilities';
import { Vector3 } from 'three';

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
export type Image360AnnotationHoveredDelegate = (
  annotation: Image360Annotation,
  pointerEvent: PointerEventData,
  direction: Vector3
) => void;

/**
 * Delegate for 360 image annotation click events
 */
export type Image360AnnotationClickedDelegate = (
  annotation: Image360Annotation,
  pointerEvent: PointerEventData,
  direction: Vector3
) => void;
