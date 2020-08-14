vec4 packFloatToVec4(float f) 
{
    float F = abs(f); 
    if(F == 0.0)
    {
        return  vec4(0.0);
    }
    float Sign =  step(0.0, -f);
    float Exponent = floor( log2(F)); 

    float Mantissa = F/ exp2(Exponent); 
    //denormalized values if all exponent bits are zero
    if(Mantissa < 1.0)
        Exponent -= 1.0;      

    Exponent +=  127.0;

    vec4 rgba;
    rgba[0] = Exponent;
    rgba[1] = 128.0 * Sign +  mod(floor(Mantissa * float(128.0)),128.0);
    rgba[2] = floor( mod(floor(Mantissa* exp2(float(23.0 - 8.0))), exp2(8.0)));
    rgba[3] = floor( exp2(23.0)* mod(Mantissa, exp2(-15.0)));
    return (1.0 / 255.0) * rgba;
}

#pragma glslify: export(packFloatToVec4)