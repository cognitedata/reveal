/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export function packFloat(f: number) {
  const F = Math.abs(f);
  if (F === 0.0) {
    return new THREE.Vector4(0.0, 0.0, 0.0, 0.0);
  }
  const Sign = -f < 0.0 ? 0.0 : 1.0;

  let Exponent = Math.floor(Math.log2(F));

  const Mantissa = F / Math.pow(2, Exponent);
  //denormalized values if all exponent bits are zero
  if (Mantissa < 1.0) Exponent -= 1.0;

  Exponent += 127.0;

  const output = new THREE.Vector4(0.0, 0.0, 0.0, 0.0);

  output.x = Exponent;
  output.y = 128.0 * Sign + (Math.floor(Mantissa * 128.0) % 128.0);
  output.z = Math.floor(Math.floor(Mantissa * Math.pow(2.0, 23.0 - 8.0)) % Math.pow(2.0, 8.0));
  output.w = Math.floor(Math.pow(2.0, 23.0) * (Mantissa % Math.pow(2.0, -15.0)));
  return output; //.multiplyScalar(1.0 / 255.0);
}

export function unpackFloat4(packedFloat: THREE.Vector4) {
  const sign = (-packedFloat.y < -128.0 ? 0.0 : 1.0) * 2.0 - 1.0;
  const exponent = packedFloat.x - 127.0;

  if (Math.abs(exponent + 127.0) < 0.001) return 0.0;

  const mantissa = (packedFloat.y % 128.0) * 65536.0 + packedFloat.z * 256.0 + packedFloat.w + 8388608.0; //8388608.0 == 0x800000
  return sign * Math.pow(2.0, exponent - 23.0) * mantissa;
}
