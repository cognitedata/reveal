/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

// https://stackoverflow.com/questions/7059962/how-do-i-convert-a-vec4-rgba-value-to-a-float @ Arjan

export function packFloat(f: number) {
  const F = abs(f);
  if (F == 0) {
    return new THREE.Vector4(0, 0, 0, 0);
  }
  const Sign = step(0.0, -f);
  let Exponent = floor(log2(F));

  const Mantissa = F / exp2(Exponent);

  if (Mantissa < 1) Exponent -= 1;

  Exponent += 127;

  const rgba = new THREE.Vector4();
  rgba.x = 128.0 * Sign + floor(Exponent * exp2(-1.0));
  rgba.y = 128.0 * mod(Exponent, 2.0) + mod(floor(Mantissa * 128.0), 128.0);
  rgba.z = floor(mod(floor(Mantissa * exp2(23.0 - 8.0)), exp2(8.0)));
  rgba.w = floor(exp2(23.0) * mod(Mantissa, exp2(-15.0)));
  return rgba;
}

export function unpackFloat4(packedFloat: THREE.Vector4) {
  const rgba = packedFloat;
  const sign = 1.0 - step(128.0, rgba.x) * 2.0;
  const exponent = 2.0 * mod(rgba.x, 128.0) + step(128.0, rgba.y) - 127.0;
  if (exponent == -127) return 0;
  const mantissa = mod(rgba.y, 128.0) * 65536.0 + rgba.z * 256.0 + rgba.w + 8388608.0;
  return sign * exp2(exponent - 23.0) * mantissa;
}

function step(edge: number, x: number): number {
  return x < edge ? 0.0 : 1.0;
}

function exp2(x: number) {
  return Math.pow(2, x);
}

function mod(x: number, y: number) {
  return x - y * floor(x / y);
}

function floor(x: number) {
  return Math.floor(x);
}

function log2(x: number) {
  return Math.log(x) / Math.log(2);
}

function abs(x: number) {
  return Math.abs(x);
}
