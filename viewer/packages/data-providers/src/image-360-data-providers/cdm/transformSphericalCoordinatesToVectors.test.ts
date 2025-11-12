/*!
 * Copyright 2025 Cognite AS
 */
import { Mock } from 'moq.ts';
import { Vector3 } from 'three';

import { transformSphericalCoordinatesToVectors } from './transformSphericalCoordinatesToVectors';
import { CoreDmImage360Properties } from './properties';

describe(transformSphericalCoordinatesToVectors.name, () => {
  const phiThetaPairs = [0, 1, Math.PI / 4, Math.PI / 4];
  const imageProperties = createImageProperties(0, 0, 0);
  const rotatedImageProperties = createImageProperties(10, 20, 30);

  it('should transform spherical coordinates to vectors correctly', () => {
    const result = transformSphericalCoordinatesToVectors(phiThetaPairs, imageProperties, '1.0.0');

    const expectedVectors = [new Vector3(0, 1, 0), new Vector3(0.5, 0.7071067811865476, 0.5)];

    expect(result.length).toBe(2);
    result.forEach((vector, index) => {
      expect(vector.x).toBeCloseTo(expectedVectors[index].x, 5);
      expect(vector.y).toBeCloseTo(expectedVectors[index].y, 5);
      expect(vector.z).toBeCloseTo(expectedVectors[index].z, 5);
    });
  });

  it('should handle rotated spherical coordinates on rotated images correctly', () => {
    const result = transformSphericalCoordinatesToVectors(phiThetaPairs, rotatedImageProperties, '1.0.0');

    const expectedVectors = [
      new Vector3(0.40319798229664927, -0.6201452579967331, 0.6729422308460629),
      new Vector3(0.7730502776604234, 0.04870293642448159, 0.6324723647660625)
    ];

    expect(result.length).toBe(2);
    result.forEach((vector, index) => {
      expect(vector.x).toBeCloseTo(expectedVectors[index].x, 5);
      expect(vector.y).toBeCloseTo(expectedVectors[index].y, 5);
      expect(vector.z).toBeCloseTo(expectedVectors[index].z, 5);
    });
  });

  it('should handle rotated spherical coordinates on rotated images for format version 1.0.1 correctly', () => {
    const result = transformSphericalCoordinatesToVectors(phiThetaPairs, rotatedImageProperties, '1.0.1');

    const expectedVectors = [
      new Vector3(0.9880316240928615, -0.12942799991943477, -0.08391604512413947),
      new Vector3(0.800529050573096, 0.31873757888961585, 0.5075032955480423)
    ];

    expect(result.length).toBe(2);
    result.forEach((vector, index) => {
      expect(vector.x).toBeCloseTo(expectedVectors[index].x, 5);
      expect(vector.y).toBeCloseTo(expectedVectors[index].y, 5);
      expect(vector.z).toBeCloseTo(expectedVectors[index].z, 5);
    });
  });

  it('Should throw an error if a list of phi theta pairs with an odd length is provided', () => {
    expect(() =>
      transformSphericalCoordinatesToVectors(
        phiThetaPairs.slice(0, -1), // Make the length odd
        imageProperties,
        '1.0.0'
      )
    ).toThrow('phiThetaPairs must have an even length');
  });
});

function createImageProperties(xAngle: number, yAngle: number, zAngle: number): CoreDmImage360Properties {
  return new Mock<CoreDmImage360Properties>()
    .setup(properties => properties.eulerRotationX)
    .returns(xAngle)
    .setup(properties => properties.eulerRotationY)
    .returns(yAngle)
    .setup(properties => properties.eulerRotationZ)
    .returns(zAngle)
    .object();
}
