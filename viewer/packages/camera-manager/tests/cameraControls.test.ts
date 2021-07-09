/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import 'jest-extended';
import ComboControls from '../src/ComboControls';

describe('Camera Controls', () => {
  let controls: ComboControls;

  beforeEach(() => {
    const camera = new THREE.PerspectiveCamera();
    const domElement = document.createElement('div');
    controls = new ComboControls(camera, domElement);
  });

  test('Getting a state should return the same as the state that was set', () => {
    const position = new THREE.Vector3(0, 1, 2);
    const target = new THREE.Vector3(3, 4, 5);

    const tolerance = 0.000001;

    controls.setState(position, target);
    const state = controls.getState();

    expect(Math.abs(state.position.x - position.x)).toBeLessThan(tolerance);
    expect(Math.abs(state.position.y - position.y)).toBeLessThan(tolerance);
    expect(Math.abs(state.position.z - position.z)).toBeLessThan(tolerance);

    expect(Math.abs(state.target.x - target.x)).toBeLessThan(tolerance);
    expect(Math.abs(state.target.y - target.y)).toBeLessThan(tolerance);
    expect(Math.abs(state.target.z - target.z)).toBeLessThan(tolerance);
  });
});
