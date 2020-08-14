float unpackVec4ToFloat( vec4 packedFloat)
{
    float sign = step(-128.0, -packedFloat[1]) * 2.0 - 1.0;
    float exponent = packedFloat[0] - 127.0;    
    if (abs(exponent + 127.0) < 0.001){
        return 0.0;           
    }

    float mantissa = mod(packedFloat[1], 128.0) * 65536.0 + packedFloat[2] * 256.0 + packedFloat[3] + 8388608.0; //8388608.0 == 0x800000
    return sign * exp2(exponent-23.0) * mantissa ;     
}

#pragma glslify: export(unpackVec4ToFloat)