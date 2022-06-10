/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ITestClass } from './ITestClass';

/**
 *
 */
@injectable()
export class TestClass implements ITestClass {
  private readonly _vector: THREE.Vector3;

  constructor(@inject(TYPES.TestVec) vector: THREE.Vector3) {
    this._vector = vector;
  }

  /**
   *
   */
  quack(): string {
    return 'Hello from TestClass: ' + this._vector.x + ' ' + this._vector.y + ' ' + this._vector.z;
  }
}
