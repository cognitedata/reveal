/*!
 * Copyright 2024 Cognite AS
 */

import { NavigationTool } from './NavigationTool';
import { type DomainObject } from '../domainObjects/DomainObject';
import { isDomainObjectIntersection } from '../domainObjectsHelpers/DomainObjectIntersection';
import { type BaseDragger } from '../domainObjectsHelpers/BaseDragger';
import { VisualDomainObject } from '../domainObjects/VisualDomainObject';
import { type AnyIntersection, CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

/**
 * The `BaseEditTool` class is an abstract class that extends the `NavigationTool` class.
 * It provides a base implementation for editing tools in a specific architecture.
 * Custom editing tools can be created by extending this class and overriding its methods.
 * This class will also proivide the dragging functionality if the picked domain object has
 * createDragger() overridden.
 */
export abstract class BaseEditTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _dragger: BaseDragger | undefined = undefined;

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override get defaultCursor(): string {
    return 'crosshair';
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._dragger = undefined;
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._dragger = await this.createDragger(event);
    if (this._dragger === undefined) {
      await super.onPointerDown(event, leftButton);
      return;
    }
    this._dragger.onPointerDown(event);
    this.deselectAll(this._dragger.domainObject);
    this._dragger.domainObject.setSelectedInteractive(true);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerDrag(event, leftButton);
      return;
    }
    const ray = this.getRay(event, true);
    this._dragger.onPointerDrag(event, ray);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (this._dragger === undefined) {
      await super.onPointerUp(event, leftButton);
    } else {
      this._dragger.onPointerUp(event);
      this._dragger = undefined;
    }
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.deselectAll();
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  /**
   * Determines whether the specified domain object can be selected or dragged by this edit tool.
   *
   * @param _domainObject - The domain object to be accepted.
   * @returns `true` if the domain object can be accepted, `false` otherwise.
   */
  protected canBeSelected(_domainObject: DomainObject): boolean {
    return false;
  }

  /**
   * Override this function to create custom dragger
   * with other creation logic. Otherwise createDragger in
   * the DomainObject itself
   */
  protected async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const domainObject = this.getIntersectedDomainObject(intersection);
    if (domainObject === undefined) {
      return undefined;
    }
    const ray = this.getRay(event);
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    const point = intersection.point.clone();
    point.applyMatrix4(matrix);
    ray.applyMatrix4(matrix);
    return domainObject.createDragger({ intersection, point, ray });
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  protected deselectAll(except?: DomainObject | undefined): void {
    const { rootDomainObject } = this;
    for (const domainObject of rootDomainObject.getDescendants()) {
      if (!this.canBeSelected(domainObject)) {
        continue;
      }
      if (except !== undefined && domainObject === except) {
        continue;
      }
      domainObject.setSelectedInteractive(false);
    }
  }

  protected getIntersectedDomainObject(
    intersection: AnyIntersection | undefined
  ): VisualDomainObject | undefined {
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    if (!this.canBeSelected(intersection.domainObject)) {
      return undefined;
    } else if (intersection.domainObject instanceof VisualDomainObject) {
      return intersection.domainObject;
    } else {
      return undefined;
    }
  }
}
