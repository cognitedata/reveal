/*!
 * Copyright 2024 Cognite AS
 */
import { Color } from 'three';
import { assertNever } from '../../../utilities/assertNever';
import { PointsOfInterestStatus } from './types';

export const DEFAULT_OVERLAY_COLOR = new Color('#C945DB');
export const PENDING_OVERLAY_COLOR = new Color('#33AA33');
export const SELECTED_COLOR = new Color('##6464FF');
export const PENDING_DELETION_OVERLAY_COLOR = new Color('#AA3333');

export function convertToSelectedColor(color: Color): Color {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.l = Math.sqrt(hsl.l);
  return new Color().setHSL(hsl.h, hsl.s, hsl.l);
}

export function getColorFromStatus(status: PointsOfInterestStatus, selected: boolean): Color {
  if (selected) {
    return SELECTED_COLOR;
  }

  return getBaseColor(status);

  function getBaseColor(status: PointsOfInterestStatus): Color {
    switch (status) {
      case PointsOfInterestStatus.Default:
        return DEFAULT_OVERLAY_COLOR;
      case PointsOfInterestStatus.PendingDeletion:
        return PENDING_DELETION_OVERLAY_COLOR;
      case PointsOfInterestStatus.PendingCreation:
        return PENDING_OVERLAY_COLOR;
      default:
        assertNever(status);
    }
  }
}
