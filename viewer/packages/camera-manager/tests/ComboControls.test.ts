/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { ComboControls } from '../src/ComboControls';
import { It, Mock } from 'moq.ts';

describe('Combo Controls', () => {
  let controls: ComboControls;

  beforeEach(() => {
    const camera = new THREE.PerspectiveCamera();
    const domElementMock = new Mock<HTMLDivElement>().setup(p => p.addEventListener(It.IsAny(), It.IsAny())).returns();
    controls = new ComboControls(camera, domElementMock.object());
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
