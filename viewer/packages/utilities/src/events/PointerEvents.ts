/*!
 * Copyright 2024 Cognite AS
 */

/**
 * This base should be extended if PointerEventsTarget is used to
 * identify proper click, double click, hover events and more
 */
export class PointerEvents {
  public onHover(_event: PointerEvent): void {}

  public async onClick(_event: PointerEvent): Promise<void> {
    return Promise.resolve();
  }

  public async onDoubleClick(_event: PointerEvent): Promise<void> {
    return Promise.resolve();
  }

  public async onPointerDown(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    return Promise.resolve();
  }
  public async onPointerUp(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    return Promise.resolve();
  }

  public async onPointerDrag(_event: PointerEvent, _leftButton: boolean): Promise<void> {
    return Promise.resolve();
  }

  public get isEnabled(): boolean {
    return true;
  }
}
