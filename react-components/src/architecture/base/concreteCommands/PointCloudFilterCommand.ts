/*!
 * Copyright 2024 Cognite AS
 */

import { type CognitePointCloudModel, type WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../commands/BaseFilterCommand';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export class PointCloudFilterCommand extends BaseFilterCommand {
  private _revisionId: number | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_FILTER', fallback: 'Points filter' };
  }

  public override get isEnabled(): boolean {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return false;
    }
    return true;
  }

  public override initializeChildrenIfNeeded(): void {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      this._children = undefined;
      this._revisionId = undefined;
      return;
    }
    if (this._revisionId === pointCloud.revisionId) {
      return;
    }
    this._revisionId = pointCloud.revisionId;
    this._children = undefined;
    super.initializeChildrenIfNeeded();
  }

  protected createChildren(): FilterItemCommand[] {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return [];
    }
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return [];
    }
    const children = [];
    for (const c of classes) {
      const pointClass = new PointClass(c.name, c.code, c.color);
      children.push(new FilterItemCommand(pointClass));
    }
    return children;
  }

  public override get isAllChecked(): boolean {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return false;
    }
    return isClassesVisible(pointCloud);
  }

  public override toggleAllChecked(): void {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return;
    }
    const isAllChecked = isClassesVisible(pointCloud);
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return;
    }
    for (const c of classes) {
      pointCloud.setClassVisible(c.code, !isAllChecked);
    }
  }
}

// Note: This is not exported, as it is only used internally

class FilterItemCommand extends BaseFilterItemCommand {
  private readonly _pointClass: PointClass;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointClass: PointClass) {
    super();
    this._pointClass = pointClass;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: this._pointClass.displayName };
  }

  public override get isChecked(): boolean {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return false;
    }
    return pointCloud.isClassVisible(this._pointClass.code);
  }

  public override invokeCore(): boolean {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return false;
    }
    const isVisible = pointCloud.isClassVisible(this._pointClass.code);
    pointCloud.setClassVisible(this._pointClass.code, !isVisible);
    return true;
  }

  public override get color(): Color | undefined {
    return this._pointClass.color;
  }

  public setChecked(value: boolean): void {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      return;
    }
    pointCloud.setClassVisible(this._pointClass.code, value);
    CommandsUpdater.update(this._renderTarget);
  }
}

class PointClass {
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

function getFirstPointCloudWithClasses(
  renderTarget: RevealRenderTarget
): CognitePointCloudModel | undefined {
  for (const pointCloud of renderTarget.getPointClouds()) {
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      continue;
    }
  }
  return undefined;
}

function isClassesVisible(pointCloud: CognitePointCloudModel): boolean {
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
