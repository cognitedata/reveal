import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';
import { Color, Vector3 } from 'three';
import { Range1 } from '../../base/utilities/geometry/Range1';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

const WARNING_COLOR = Color.NAMES.red;

const RADIUS_MIN = 0.05;
const RADIUS_MAX = 5.0;
const RADIUS_CHANGE_FACTOR = 0.05;

export enum CircleMarkerType {
  MouseCircleMarker,
  FocusPointMarker
}

/**
 * Represents a visual domain object for a circle marker in the architecture.
 *
 * This class encapsulates the properties and behaviors of a circle marker,
 * including its position, radius, type, color, and rendering style.
 * It provides methods for handling color changes, wheel interactions for resizing,
 * and overrides for visibility and labeling in the object tree.
 *
 * There are tow types of circle markers:
 * - MouseCircleMarker: A circle marker that follows the mouse cursor.
 * - FocusPointMarker: A circle marker that indicates a focus point in the 3D space.
 *
 * The application developer is responsible to set the position, size and visibility of the circle marker,
 * typically done in the tools
 */
export class CircleMarkerDomainObject extends VisualDomainObject {
  public readonly position: Vector3 = new Vector3();
  public radius = 0.3;
  public legalRadiusRange = new Range1(RADIUS_MIN, RADIUS_MAX);
  public readonly type: CircleMarkerType;

  constructor(type: CircleMarkerType = CircleMarkerType.MouseCircleMarker) {
    super();
    this.type = type;
    this.color.setHex(getDefaultColor(type));
  }

  public get style(): CircleMarkerRenderStyle {
    return this.getRenderStyle() as CircleMarkerRenderStyle;
  }

  public override get typeName(): TranslationInput {
    if (this.type === CircleMarkerType.FocusPointMarker) {
      return { untranslated: 'Focus point marker' };
    }
    return { untranslated: 'Mouse circle marker' };
  }

  public override get isVisibleInTree(): boolean {
    return false;
  }

  public override get hasIndexOnLabel(): boolean {
    return false; // Because it's only one of this type
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new CircleMarkerRenderStyle();
    if (this.type === CircleMarkerType.FocusPointMarker) {
      style.solidOpacity = 1;
      style.maxDistanceForSizeAdjustments = 7; // Mimics the behavior of the point size close to camera done by point clouds on Reveal
    }
    return style;
  }

  public setDefaultColor(): void {
    if (this.color.getHex() === getDefaultColor(this.type)) {
      return;
    }
    this.color.setHex(getDefaultColor(this.type));
    this.notify(Changes.color);
  }

  public setWarningColor(): void {
    if (this.color.getHex() === WARNING_COLOR) {
      return;
    }
    this.color.setHex(WARNING_COLOR);
    this.notify(Changes.color);
  }

  public onWheel(wheelDelta: number): boolean {
    const factor = 1 - Math.sign(wheelDelta) * RADIUS_CHANGE_FACTOR;
    const newRadius = this.radius * factor;
    if (newRadius === this.radius) {
      return false; // No change
    }
    if (!this.legalRadiusRange.isInside(newRadius)) {
      return false; // Too small or large
    }
    this.radius = newRadius;
    this.notify(Changes.geometry);
    return true;
  }
}

function getDefaultColor(type: CircleMarkerType): number {
  if (type === CircleMarkerType.FocusPointMarker) {
    return 0xf2ff19; // Yellow-green
  }
  return Color.NAMES.yellow;
}

export function getCircleMarker(root: DomainObject): CircleMarkerDomainObject | undefined {
  for (const descendant of root.getDescendantsByType(CircleMarkerDomainObject)) {
    if (descendant.type === CircleMarkerType.MouseCircleMarker) {
      return descendant;
    }
  }
  return undefined;
}

export function getOrCreateCircleMarker(root: DomainObject): CircleMarkerDomainObject {
  let domainObject = getCircleMarker(root);
  if (domainObject === undefined) {
    domainObject = new CircleMarkerDomainObject(CircleMarkerType.MouseCircleMarker);
    root.addChildInteractive(domainObject);
  }
  return domainObject;
}

export function getFocusPointMarker(root: DomainObject): CircleMarkerDomainObject | undefined {
  for (const descendant of root.getDescendantsByType(CircleMarkerDomainObject)) {
    if (descendant.type === CircleMarkerType.FocusPointMarker) {
      return descendant;
    }
  }
  return undefined;
}

export function getOrCreateFocusPointMarker(root: DomainObject): CircleMarkerDomainObject {
  let domainObject = getFocusPointMarker(root);
  if (domainObject === undefined) {
    domainObject = new CircleMarkerDomainObject(CircleMarkerType.FocusPointMarker);
    root.addChildInteractive(domainObject);
  }
  return domainObject;
}
