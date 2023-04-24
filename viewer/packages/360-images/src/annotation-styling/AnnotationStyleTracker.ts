/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel } from '@cognite/sdk/dist/src';
import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import { applyStyleToMaterial, satisfiesFilter } from './assignStyle';
import { Image360AnnotationAppearance, Image360AnnotationAppearanceEdit, Image360AnnotationFilter } from './types';

import { Color, MeshBasicMaterial } from 'three';

export class AnnotationStyleTracker {
  private readonly _annotationStyleAssignments: [Image360AnnotationFilter, Image360AnnotationAppearanceEdit][] = [];
  private _defaultStyle: Image360AnnotationAppearanceEdit = {};

  private _needsUpdate: boolean = false;

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  resetNeedsUpdate(): void {
    this._needsUpdate = false;
  }

  setDefaultStyle(appearanceEdit: Image360AnnotationAppearanceEdit): void {
    this._defaultStyle = appearanceEdit;
    this._needsUpdate = true;
  }

  assignAnnotationStyleEdit(filter: Image360AnnotationFilter, appearanceEdit: Image360AnnotationAppearanceEdit): void {
    const index = this._annotationStyleAssignments.findIndex(assignment => assignment[0] === filter);

    if (index < 0) {
      this._annotationStyleAssignments.push([filter, appearanceEdit]);
    } else {
      this._annotationStyleAssignments[index][1] = appearanceEdit;
    }

    this._needsUpdate = true;
  }

  unassignAnnotationStyleEdit(filter: Image360AnnotationFilter) {
    const index = this._annotationStyleAssignments.findIndex(assignment => assignment[0] === filter);

    if (index >= 0) {
      this._annotationStyleAssignments.splice(index, 1);
    }
    this._needsUpdate = true;
  }

  clear(): void {
    this._annotationStyleAssignments.splice(0);
    this._needsUpdate = true;
  }

  applyStyles(annotationObjects: ImageAnnotationObject[]): void {
    annotationObjects.forEach(obj => {
      const fallbackStyle = getFallbackStyle(obj.annotation);
      applyStyleToMaterial(obj.getMaterial(), fallbackStyle);
      applyStyleToMaterial(obj.getMaterial(), this._defaultStyle);
    });
    this._annotationStyleAssignments.forEach(([filter, edit]) => {
      annotationObjects
        .filter(obj => filter(obj.annotation))
        .forEach(obj => applyStyleToMaterial(obj.getMaterial(), edit));
    });
  }
}

function getFallbackStyle(_annotation: AnnotationModel): Image360AnnotationAppearance {
  return {
    color: new Color(1, 1, 0),
    visible: true
  };
}

function applyStyleToMaterial(material: MeshBasicMaterial, styling: Image360AnnotationAppearanceEdit): void {
  if (styling.color !== undefined) {
    material.color = styling.color;
  }

  if (styling.visible !== undefined) {
    material.visible = styling.visible;
  }

  material.needsUpdate = true;
}
