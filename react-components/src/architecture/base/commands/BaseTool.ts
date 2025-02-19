/*!
 * Copyright 2024 Cognite AS
 */

import { MOUSE, type Ray, Raycaster, Vector2, type Vector3 } from 'three';
import { RenderTargetCommand } from './RenderTargetCommand';
import {
  type CustomObjectIntersection,
  type AnyIntersection,
  type ICustomObject
} from '@cognite/reveal';
import { GroupThreeView } from '../views/GroupThreeView';
import {
  type DomainObjectIntersection,
  isDomainObjectIntersection
} from '../domainObjectsHelpers/DomainObjectIntersection';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type BaseCommand } from './BaseCommand';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';
import { ThreeView } from '../views/ThreeView';
import { UndoManager } from '../undo/UndoManager';
import { CommandChanges } from '../domainObjectsHelpers/CommandChanges';
import { ContextMenuUpdater } from '../reactUpdaters/ContextMenuUpdater';
import { getToolbar } from './factory/ToolbarFactory';

/**
 * Base class for interactions in the 3D viewer
 * Provides common functionality and virtual methods to be overridden by derived classes.
 */
export abstract class BaseTool extends RenderTargetCommand {
  private readonly _undoManager = new UndoManager();

  // ==================================================
  // OVERRIDES
  // =================================================

  public override get isChecked(): boolean {
    return this.activeTool === this;
  }

  protected override invokeCore(): boolean {
    if (this.isChecked) {
      this.renderTarget.commandsController.activateDefaultTool();
    } else {
      this.renderTarget.commandsController.setActiveTool(this);
    }
    return true;
  }

  public override get undoManager(): UndoManager | undefined {
    return this._undoManager;
  }

  // ==================================================
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public get defaultCursor(): string {
    return 'default';
  }

  public getAnchoredDialogContent(): AnchoredDialogContent | undefined {
    return undefined;
  }

  public getToolbarStyle(): PopupStyle {
    // Override this to place the toolbar
    // Default lower left corner
    return new PopupStyle({ bottom: 0, left: 0 });
  }

  public onActivate(): void {
    this.update(CommandChanges.active);
    this.setDefaultCursor();
    this.clearDragging();
  }

  public onDeactivate(): void {
    this.update(CommandChanges.deactive);
    this.clearDragging();
  }

  public clearDragging(): void {
    // Override this to clear any temporary objects in the tool, like the dragger
  }

  public onHover(_event: PointerEvent): void {
    // Fast. Use this for hover effects when not
    // doing intersection with CAD models and other large models
  }

  public onHoverByDebounce(_event: PointerEvent): void {
    // Debounce version. Use this when doing intersection with CAD models and other large models
  }

  public async onClick(event: PointerEvent): Promise<void> {
    if (event.button === (MOUSE.RIGHT as number)) {
      await this.openContextMenu(event);
    } else if (this.isContextMenuOpen()) {
      await this.closeContextMenu();
    }

    await Promise.resolve();
  }

  public async onDoubleClick(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onLeftPointerDown(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onLeftPointerDrag(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onLeftPointerUp(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onRightPointerDown(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onRightPointerDrag(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onRightPointerUp(_event: PointerEvent): Promise<void> {
    await Promise.resolve();
  }

  public async onWheel(_event: WheelEvent, _delta: number): Promise<void> {
    await Promise.resolve();
  }

  public onFocusChanged(_haveFocus: boolean): void {}

  public onKey(_event: KeyboardEvent, _down: boolean): void {}

  public onDeleteKey(): void {}

  public onEscapeKey(): void {}

  public onUndo(): void {}

  // ==================================================
  // INSTANCE METHODS: Intersections
  // ==================================================

  protected async getIntersection(
    event: PointerEvent | WheelEvent,
    domainObjectPredicate?: (domainObject: DomainObject) => boolean
  ): Promise<AnyIntersection | undefined> {
    const viewer = this.renderTarget.viewer;

    const point = viewer.getPixelCoordinatesFromEvent(event);

    if (domainObjectPredicate === undefined) {
      return await viewer.getAnyIntersectionFromPixel(point);
    }
    // Here we use a custom predicate to filter the intersections
    // This maps from ICustomObject to DomainObject
    const predicate = (customObject: ICustomObject): boolean => {
      if (domainObjectPredicate === undefined) {
        return true;
      }
      if (!(customObject instanceof ThreeView)) {
        return false;
      }
      return domainObjectPredicate(customObject.domainObject as DomainObject);
    };
    return await viewer.getAnyIntersectionFromPixel(point, { predicate });
  }

  protected getSpecificIntersection(
    event: PointerEvent,
    domainObjectPredicate?: (domainObject: DomainObject) => boolean
  ): DomainObjectIntersection | undefined {
    // This function is similar to getIntersection, but it only considers a specific DomainObject
    const { renderTarget, rootDomainObject } = this;
    const { viewer } = renderTarget;

    const point = viewer.getPixelCoordinatesFromEvent(event);
    const intersectInput = viewer.createCustomObjectIntersectInput(point);

    let closestIntersection: CustomObjectIntersection | undefined;
    let closestDistanceToCamera: number | undefined;
    for (const domainObject of rootDomainObject.getDescendants()) {
      if (domainObjectPredicate !== undefined && !domainObjectPredicate(domainObject)) {
        continue;
      }
      for (const view of domainObject.views.getByType(GroupThreeView)) {
        if (view.renderTarget !== renderTarget) {
          continue;
        }
        const intersection = view.intersectIfCloser(intersectInput, closestDistanceToCamera);
        if (intersection === undefined) {
          continue;
        }
        closestDistanceToCamera = intersection.distanceToCamera;
        closestIntersection = intersection;
      }
    }
    if (!isDomainObjectIntersection(closestIntersection)) {
      return undefined;
    }
    return closestIntersection;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getToolbar(): Array<BaseCommand | undefined> | undefined {
    return getToolbar(this);
  }

  protected getRaycaster(event: PointerEvent | WheelEvent): Raycaster {
    const { renderTarget } = this;
    const normalizedCoords = this.getNormalizedPixelCoordinates(event);
    const raycaster = new Raycaster();
    raycaster.setFromCamera(normalizedCoords, renderTarget.camera);
    return raycaster;
  }

  protected getRay(event: PointerEvent | WheelEvent, convertToCdf: boolean = false): Ray {
    const ray = this.getRaycaster(event).ray;
    if (convertToCdf) {
      ray.applyMatrix4(this.renderTarget.fromViewerMatrix);
    }
    return ray;
  }

  protected getNormalizedPixelCoordinates(event: PointerEvent | WheelEvent): Vector2 {
    const { renderTarget } = this;
    const { viewer } = renderTarget;
    const point = viewer.getPixelCoordinatesFromEvent(event);
    return viewer.getNormalizedPixelCoordinates(point);
  }

  // ==================================================
  // INSTANCE METHODS: Misc
  // ==================================================

  public setDefaultCursor(): void {
    this.renderTarget.cursor = this.defaultCursor;
  }

  public setCursor(cursor: string): void {
    this.renderTarget.cursor = cursor;
  }

  private async openContextMenu(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (this._renderTarget === undefined) {
      return;
    }

    this._renderTarget.contextMenuController.contextMenuPositionData = {
      clickEvent: event,
      position: new Vector2(event.layerX, event.layerY),
      intersection
    };

    ContextMenuUpdater.update();
  }

  private async closeContextMenu(): Promise<void> {
    if (this._renderTarget === undefined) {
      return;
    }

    this._renderTarget.contextMenuController.contextMenuPositionData = undefined;
  }

  private isContextMenuOpen(): boolean {
    return this._renderTarget?.contextMenuController.contextMenuPositionData !== undefined;
  }
}

/**
 * AnchorDialog
 */

export type CustomListener = { eventName: string; callback: (event: Event) => void };

export type AnchoredDialogContent = {
  position: Vector3;
  onCloseCallback: () => void;
  contentCommands: BaseCommand[];
  customListeners?: CustomListener[];
};
