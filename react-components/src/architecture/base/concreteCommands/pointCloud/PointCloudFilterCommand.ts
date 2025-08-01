import { type WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../../commands/BaseFilterCommand';
import { type PointCloud } from '../../../concrete/reveal/RevealTypes';
import { type RootDomainObject } from '../../domainObjects/RootDomainObject';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';

export class PointCloudFilterCommand extends BaseFilterCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // Keep a soft reference to the last used PointCloudDomainObject (the first one)
  // If the user removed this, the next PointCloudDomainObject will be used instead.
  private _currentUniqueId: number | undefined = undefined;

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
    const classes = domainObject.model.getClasses();
    if (classes === undefined || classes.length === 0) {
      return [];
    }
    const children = [];
    for (const c of classes) {
      const pointClass = new PointClass(c.name, c.code, c.color);
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
    const isAllChecked = isAllClassesVisible(pointCloud);
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return false;
    }
    for (const c of classes) {
      pointCloud.setClassVisible(c.code, !isAllChecked);
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
  private readonly _currentUniqueId: number;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointClass: PointClass, currentUniqueId: number) {
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
    const classes = domainObject.model.getClasses();
    if (classes === undefined || classes.length === 0) {
      continue;
    }
    return domainObject;
  }
  return undefined;
}

function getCurrentDomainObject(
  root: RootDomainObject,
  uniqueId: number
): PointCloudDomainObject | undefined {
  const domainObject = root.getThisOrDescendantByUniqueId(uniqueId);
  if (domainObject === undefined) {
    return undefined;
  }
  return domainObject as PointCloudDomainObject;
}

function isAllClassesVisible(pointCloud: PointCloud): boolean {
  const classes = pointCloud.getClasses();
  if (classes === undefined || classes.length === 0) {
    return false;
  }
  for (const c of classes) {
    if (!pointCloud.isClassVisible(c.code)) {
      return false;
    }
  }
  return true;
}
