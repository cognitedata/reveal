/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolume, CylinderPrimitive, Geometry } from '../annotationTypes';
import { CompositeShape } from './shapes/CompositeShape';
import { Cylinder } from './shapes/Cylinder';
import { IShape } from './shapes/IShape';
import { StyledObject } from './StyledObject';
import { StyledObjectInfo } from './StyledObjectInfo';

function translateCylinder(cylinder: CylinderPrimitive): Cylinder {
  return new Cylinder(
    [cylinder.center_a.x, cylinder.center_a.y, cylinder.center_a.z],
    [cylinder.center_b.x, cylinder.center_b.y, cylinder.center_b.z],
    cylinder.radius
  );
}
function isCylinder(geometry: Geometry): geometry is CylinderPrimitive {
  return (geometry as any).center_a != undefined;
}

function annotationsToObjects(bvs: BoundingVolume[]): StyledObject[] {
  let numUnrecognized = 0;
  let numTotal = 0;
  let idCounter = 0;

  const resultObjects: StyledObject[] = [];

  for (const bv of bvs) {
    idCounter++;
    const shapes: IShape[] = [];

    for (const primitive of bv.region) {
      numTotal++;

      if (isCylinder(primitive)) {
        shapes.push(translateCylinder(primitive));
      } else {
        numUnrecognized++;
      }
    }

    const compShape = new CompositeShape(shapes);
    const styledObject: StyledObject = {
      shape: compShape,
      objectId: idCounter
    };

    resultObjects.push(styledObject);
  }

  if (numUnrecognized > 0) {
    console.log(
      'Found a total of',
      numTotal,
      'primitives from annotations, did not translate',
      numUnrecognized,
      'unrecognized objects'
    );
  } else {
    console.log('Fetched annotations, returning', numTotal, 'objects');
  }

  return resultObjects;
}


export function annotationsToObjectInfo(annotations: BoundingVolume[]): StyledObjectInfo {
  const styledObjects = annotationsToObjects(annotations);

  return {
    styledObjects: styledObjects.map(obj => {
      return {
        objectId: obj.objectId,
        shape: obj.shape.toRawShape()
      };
    })
  };
}
