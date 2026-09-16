/*!
 * Copyright 2021 Cognite AS
 */

import { PerspectiveCamera, Vector3 } from 'three';
import { ComboControls } from '../src/ComboControls';
import { It, Mock } from 'moq.ts';

describe('Combo Controls', () => {
  let controls: ComboControls;

  beforeEach(() => {
    const camera = new PerspectiveCamera();
    const domElementMock = new Mock<HTMLDivElement>().setup(p => p.addEventListener(It.IsAny(), It.IsAny())).returns();
    controls = new ComboControls(camera, domElementMock.object());
  });

  test('should return the same as the state that was set', () => {
    const position = new Vector3(0, 1, 2);
    const target = new Vector3(3, 4, 5);

    const tolerance = 0.000001;

    controls.setState(position, target);
    const state = controls.getState();

    expect(state.position.distanceTo(position)).toBeLessThan(tolerance);
    expect(state.target.distanceTo(target)).toBeLessThan(tolerance);
  });
});
