import { type WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import { type TranslationInput } from '../../utilities/translation/TranslateInput';
import { type Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../../commands/BaseFilterCommand';
import { type PointCloud } from '../../../concrete/reveal/RevealTypes';
import { type RootDomainObject } from '../../domainObjects/RootDomainObject';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { type UniqueId } from '../../utilities/types';

export class PointCloudFilterCommand extends BaseFilterCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // Keep a soft reference to the last used PointCloudDomainObject (the first one)
  // If the user removed this, the next PointCloudDomainObject will be used instead.
  private _currentUniqueId: UniqueId | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'POINTS_FILTER' };
  }

  public override get isEnabled(): boolean {
    return this.getCurrentDomainObject() !== undefined;
  }

  public override initializeChildrenIfNeeded(): void {
    const domainObject = getFirstPointCloudWithClasses(this.rootDomainObject);
    if (domainObject === undefined) {
      this._children = undefined;
      this._currentUniqueId = undefined;
      return;
    }
    if (this._currentUniqueId === domainObject.uniqueId) {
      return; // Nothing changed
    }
    this._currentUniqueId = domainObject.uniqueId;
    this._children = undefined;
    super.initializeChildrenIfNeeded();
  }

  protected override createChildren(): FilterItemCommand[] {
    const domainObject = this.getCurrentDomainObject();
    if (domainObject === undefined) {
      return [];
    }
    if (!hasSomeClasses(domainObject.model)) {
      return [];
    }
    const children = [];
    for (const item of domainObject.model.getClasses()) {
      if (!domainObject.model.hasClass(item.code)) {
        continue;
      }
      const pointClass = new PointClass(item.name, item.code, item.color);
      children.push(new FilterItemCommand(pointClass, domainObject.uniqueId));
    }
    return children;
  }

  public override get isAllChecked(): boolean {
    // Override the default implementation to optimize the logic
    const domainObject = this.getCurrentDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    return isAllClassesVisible(domainObject.model);
  }

  protected override toggleAllCheckedCore(): boolean {
    // Override the default implementation to optimize the logic
    const domainObject = this.getCurrentDomainObject();
    if (domainObject === undefined) {
      return false;
    }
    const pointCloud = domainObject.model;
    if (!hasSomeClasses(pointCloud)) {
      return false;
    }
    const isAllChecked = isAllClassesVisible(pointCloud);
    for (const item of pointCloud.getClasses()) {
      pointCloud.setClassVisible(item.code, !isAllChecked);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getCurrentDomainObject(): PointCloudDomainObject | undefined {
    if (this._currentUniqueId === undefined) {
      return undefined;
    }
    return getCurrentDomainObject(this.rootDomainObject, this._currentUniqueId);
  }
}

// Note: This is not exported, as it is only used internally

export class FilterItemCommand extends BaseFilterItemCommand {
  private readonly _pointClass: PointClass;
  private readonly _currentUniqueId: UniqueId;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointClass: PointClass, currentUniqueId: UniqueId) {
    super();
    this._pointClass = pointClass;
    this._currentUniqueId = currentUniqueId;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: this._pointClass.displayName };
  }

  public override get isChecked(): boolean {
    const domainObject = getCurrentDomainObject(this.rootDomainObject, this._currentUniqueId);
    if (domainObject === undefined) {
      return false;
    }
    return domainObject.model.isClassVisible(this._pointClass.code);
  }

  public override get color(): Color | undefined {
    return this._pointClass.color;
  }

  protected override setCheckedCore(value: boolean): boolean {
    const domainObject = getCurrentDomainObject(this.rootDomainObject, this._currentUniqueId);
    if (domainObject === undefined) {
      return false;
    }
    if (domainObject.model.isClassVisible(this._pointClass.code) === value) {
      return false;
    }
    domainObject.model.setClassVisible(this._pointClass.code, value);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================
}

export class PointClass {
  name: string;
  code: number | WellKnownAsprsPointClassCodes;
  color: Color;

  constructor(name: string, code: number | WellKnownAsprsPointClassCodes, color: Color) {
    this.name = name;
    this.code = code;
    this.color = color;
  }

  public get displayName(): string {
    const name = this.name;
    const changedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');

    if (!name.startsWith('ReservedOr')) {
      return changedName;
    }
    const betterKey = changedName.slice('ReservedOr'.length);
    return `${betterKey} (legacy)`;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getFirstPointCloudWithClasses(root: RootDomainObject): PointCloudDomainObject | undefined {
  for (const domainObject of root.getDescendantsByType(PointCloudDomainObject)) {
    if (hasSomeClasses(domainObject.model)) {
      return domainObject;
    }
  }
  return undefined;
}

function getCurrentDomainObject(
  root: RootDomainObject,
  uniqueId: UniqueId
): PointCloudDomainObject | undefined {
  const domainObject = root.getThisOrDescendantByUniqueId(uniqueId);
  if (domainObject === undefined) {
    return undefined;
  }
  return domainObject instanceof PointCloudDomainObject ? domainObject : undefined;
}

function isAllClassesVisible(pointCloud: PointCloud): boolean {
  if (!hasSomeClasses(pointCloud)) {
    return false;
  }
  for (const item of pointCloud.getClasses()) {
    if (pointCloud.hasClass(item.code) && !pointCloud.isClassVisible(item.code)) {
      return false;
    }
  }
  return true;
}

function hasSomeClasses(pointCloud: PointCloud): boolean {
  const classes = pointCloud.getClasses();
  if (classes === undefined || classes.length === 0) {
    return false;
  }
  return classes.some((item) => pointCloud.hasClass(item.code));
}
