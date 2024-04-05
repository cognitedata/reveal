/*!
 * Copyright 2024 Cognite AS
 */

/**
 * This interface should be implemented if PointerEventsDetector is used to
 * identify proper click, double click and hover events
 */

export interface IPointerEvents {
  onClick(event: PointerEvent): void;
  onHover(event: PointerEvent): void;
  onDoubleClick(event: PointerEvent): void;
}
