/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolume, BoxPrimitive, CylinderPrimitive, Geometry } from '../annotationTypes';
import { Box } from './shapes/Box';
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

function translateBox(box: BoxPrimitive): Box {
  const tr = box.matrix.clone().transpose();

  return new Box(tr.toArray());
}

function isCylinder(geometry: Geometry): geometry is CylinderPrimitive {
  return (geometry as any).center_a != undefined;
}

function isBox(geometry: Geometry): geometry is BoxPrimitive {
  return (geometry as any).matrix != undefined;
}

export function annotationsToObjects(bvs: BoundingVolume[]): StyledObject[] {
  let idCounter = 0;

  const resultObjects = bvs.map((bv) => {
    idCounter++;
    const shapes: IShape[] = [];

    bv.region.map(primitive => {
      if (isCylinder(primitive)) {
        shapes.push(translateCylinder(primitive));
      } else if (isBox(primitive)) {
        shapes.push(translateBox(primitive));
      }
    });

    const compShape = new CompositeShape(shapes);
    const styledObject: StyledObject = {
      shape: compShape,
      objectId: idCounter
    };

    return styledObject;
  });

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
