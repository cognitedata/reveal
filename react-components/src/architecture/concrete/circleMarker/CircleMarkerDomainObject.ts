import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { CircleMarkerRenderStyle } from './CircleMarkerRenderStyle';
import { Color, Vector3 } from 'three';
import { Range1 } from '../../base/utilities/geometry/Range1';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type TranslationInput } from '../../base/utilities/translation/TranslateInput';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';

const WARNING_COLOR = Color.NAMES.red;
const DEFAULT_COLOR = Color.NAMES.yellow;

export class CircleMarkerDomainObject extends VisualDomainObject {
  public readonly position: Vector3 = new Vector3();
  public radius = 0.3;
  public legalRadiusRange = new Range1(0.05, 5.0);

  public override get typeName(): TranslationInput {
    return { untranslated: 'Circle marker' };
  }

  public constructor() {
    super();
    this.color.setHex(DEFAULT_COLOR);
  }

  public override get isVisibleInTree(): boolean {
    return false;
  }

  public override get hasIndexOnLabel(): boolean {
    return false; // Because it's only one of this type
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new CircleMarkerRenderStyle();
  }

  public setDefaultColor(): void {
    if (this.color.getHex() === DEFAULT_COLOR) {
      return;
    }
    this.color.setHex(DEFAULT_COLOR);
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
    const factor = 1 - Math.sign(wheelDelta) * 0.05;
    const newRadius = this.radius * factor;
    if (!this.legalRadiusRange.isInside(newRadius)) {
      return false; // Too small
    }
    this.radius = newRadius;
    this.notify(Changes.geometry);
    return true;
  }
}

export function getCircleMarker(root: DomainObject): CircleMarkerDomainObject | undefined {
  return root.getDescendantByType(CircleMarkerDomainObject);
}

export function getOrCreateCircleMarker(root: DomainObject): CircleMarkerDomainObject {
  let domainObject = getCircleMarker(root);
  if (domainObject === undefined) {
    domainObject = new CircleMarkerDomainObject();
    root.addChildInteractive(domainObject);
  }
  return domainObject;
}
