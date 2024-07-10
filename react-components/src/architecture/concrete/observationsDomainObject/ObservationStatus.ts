/*!
 * Copyright 2024 Cognite AS
 */
import { type Color } from 'three';
import {
  convertToSelectedColor,
  DEFAULT_OVERLAY_COLOR,
  PENDING_DELETION_OVERLAY_COLOR,
  PENDING_OVERLAY_COLOR
} from './color';
import { assertNever } from '../../../utilities/assertNever';

export enum ObservationStatus {
  Normal,
  PendingCreation,
  PendingDeletion
}

export function getColorFromStatus(status: ObservationStatus, selected: boolean): Color {
  const baseColor = getBaseColor(status);

  if (selected) {
    return convertToSelectedColor(baseColor);
  }

  return baseColor;

  function getBaseColor(status: ObservationStatus): Color {
    switch (status) {
      case ObservationStatus.Normal:
        return DEFAULT_OVERLAY_COLOR;
      case ObservationStatus.PendingCreation:
        return PENDING_OVERLAY_COLOR;
      case ObservationStatus.PendingDeletion:
        return PENDING_DELETION_OVERLAY_COLOR;
      default:
        assertNever(status);
    }
  }
}
