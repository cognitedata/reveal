// https://stackoverflow.com/questions/7059962/how-do-i-convert-a-vec4-rgba-value-to-a-float @ Arjan
float unpackVec4ToFloat( vec4 packedFloat)
{
  vec4 rgba = packedFloat;
  float sign = 1.0 - step(128.0, rgba.x) * 2.0;
  float exponent = 2.0 * mod(rgba.x, 128.0) + step(128.0, rgba.y) - 127.0;
  if (exponent == -127.0) return 0.0;
  float mantissa = mod(rgba.y, 128.0) * 65536.0 + rgba.z * 256.0 + rgba.w + 8388608.0;
  return sign * exp2(exponent - 23.0) * mantissa;   
}

#pragma glslify: export(unpackVec4ToFloat)