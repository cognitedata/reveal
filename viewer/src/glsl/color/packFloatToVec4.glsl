vec4 packFloatToVec4(float f) 
{
  float F = abs(f);
  if (F == 0) {
    return vec4(0.0);
  }
  float Sign = step(0.0, -f);
  float Exponent = floor(log2(F));

  float Mantissa = F / exp2(Exponent);

  if (Mantissa < 1.0){
    Exponent -= 1.0;
  } 

  Exponent += 127.0;

  vec4 rgba = vec4(0.0);
  rgba.x = 128.0 * Sign + floor(Exponent * exp2(-1.0));
  rgba.y = 128.0 * mod(Exponent, 2.0) + mod(floor(Mantissa * 128.0), 128.0);
  rgba.z = floor(mod(floor(Mantissa * exp2(23.0 - 8.0)), exp2(8.0)));
  rgba.w = floor(exp2(23.0) * mod(Mantissa, exp2(-15.0)));
  return rgba;
}

#pragma glslify: export(packFloatToVec4)