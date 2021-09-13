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
    const buffer = fs.readFileSync(__dirname + '/test.glb');
    console.log(__dirname);
    const dir = fs.readdirSync(__dirname);
    console.log(dir);

    //Act
    const geometries = parser.parseSector(buffer.buffer);

    //Assert
    expect(geometries.length).toBeGreaterThan(0);
  });
});
