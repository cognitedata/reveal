/*!
 * Copyright 2021 Cognite AS
 */

import fs from 'fs';

import 'jest-extended';
import GltfSectorParser from '../src/GltfSectorParser';

describe('Gltf Sector Parser', () => {
  test('Parsing test.glb should have result', () => {
    //Arrange
    const parser = new GltfSectorParser();
    const buffer = fs.readFileSync('./tests/test.glb');

    //Act
    const geometries = parser.parseSector(buffer.buffer);

    //Assert
    expect(geometries.length).toBeGreaterThan(0);
  });
});
