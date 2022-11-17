/*!
 * Copyright 2022 Cognite AS
 */

import { ClassificationInfo } from './potree-three-loader/loading/ClassificationInfo';

import { WellKnownAsprsPointClassCodes } from './types';

import { PointCloudMaterial, PointClassification, DEFAULT_CLASSIFICATION } from '@reveal/rendering';
import { createDistinctColors } from '@reveal/utilities';

import { Color, Vector4 } from 'three';

type ClassificationMap = { [key: string]: { rgb: Color; code: number } };

const PotreeDefaultPointClass = 'DEFAULT';

export class ClassificationHandler {
  private readonly _classification: PointClassification;
  private readonly _material: PointCloudMaterial;
  private readonly _classNameToCodeMap: ClassificationMap;

  constructor(material: PointCloudMaterial, classificationInfo: ClassificationInfo) {
    this._material = material;

    this._classNameToCodeMap = this.createClassNameToCodeMap(classificationInfo);
    this._classification = this.createClassificationFromClassificationMap(this._classNameToCodeMap);
    this._material.classification = this._classification;
  }

  private createClassNameToCodeMap(classificationInfo: ClassificationInfo): ClassificationMap {
    if (classificationInfo.classificationSets.length === 0) {
      return this.createDefaultClassNameToCodeMap();
    }

    const classMap: { [key: string]: { rgb: Color; code: number } } = {};

    const inputClassifications = classificationInfo.classificationSets[0].classificationSet;

    const fallbackColors = createDistinctColors(inputClassifications.length);

    inputClassifications.forEach((pointClass, index) => {
      const rgb = pointClass.rgb ? new Color(pointClass.rgb) : fallbackColors[index];

      classMap[pointClass.name] = { rgb, code: pointClass.code };
    });

    return classMap;
  }

  private createDefaultClassNameToCodeMap(): ClassificationMap {
    const classNames = Object.keys(DEFAULT_CLASSIFICATION);

    const classMap: { [key: string]: { rgb: Color; code: number } } = {};
    const fallbackColors = createDistinctColors(classNames.length);

    classNames.forEach((x, index) => {
      const code = x === PotreeDefaultPointClass ? -1 : parseInt(x, 10);
      const rgb = this.getDefaultClassColor(x) ?? fallbackColors[index];
      classMap[this.getClassNameFromCode(code)] = { code, rgb };
    });

    return classMap;
  }

  private getDefaultClassColor(name: string): Color | undefined {
    if (!(name in DEFAULT_CLASSIFICATION)) {
      return undefined;
    }

    const v = DEFAULT_CLASSIFICATION[name];
    return new Color(v.x, v.y, v.z);
  }

  private getClassNameFromCode(code: number): string {
    return WellKnownAsprsPointClassCodes[code] ?? `Class ${code}`;
  }

  private createClassificationFromClassificationMap(classificationMap: ClassificationMap): PointClassification {
    const classification: PointClassification = { DEFAULT: DEFAULT_CLASSIFICATION.DEFAULT };
    Object.keys(classificationMap).forEach(name => {
      const color = classificationMap[name].rgb;
      classification[classificationMap[name].code] = new Vector4(...color.toArray(), 1.0);
    });

    return classification;
  }

  get classification(): PointClassification {
    return this._classification;
  }

  get classes(): Array<{ name: string; code: number }> {
    const codesAndNames = Object.entries(this._classNameToCodeMap).map(nameAndCode => ({
      name: nameAndCode[0],
      code: nameAndCode[1].code
    }));

    return codesAndNames.sort((a, b) => a.code - b.code);
  }

  createPointClassKey(pointClass: number | WellKnownAsprsPointClassCodes): number {
    const className = this.getClassNameFromCode(pointClass);
    if (className in this._classNameToCodeMap) {
      return this._classNameToCodeMap[className].code;
    }

    if (typeof pointClass === 'string') {
      throw Error(`Unrecognized string ${pointClass} used as class name`);
    }

    if (pointClass === WellKnownAsprsPointClassCodes.Default) {
      // Potree has a special class 'DEFAULT'. Our map has number keys, but this one is specially
      // handled in Potree so we ignore type.
      return PotreeDefaultPointClass as any;
    }

    return pointClass;
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    const key = this.createPointClassKey(pointClass);

    this._classification[key].w = visible ? 1.0 : 0.0;
    this._material.classification = this._classification;
  }

  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    const key = this.createPointClassKey(pointClass);
    return this.classification[key] !== undefined;
  }

  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    if (!this.hasClass(pointClass)) {
      throw new Error(`Point cloud model doesn't have class ${pointClass}`);
    }
    const key = this.createPointClassKey(pointClass);
    return this.classification[key].w !== 0.0;
  }
}
