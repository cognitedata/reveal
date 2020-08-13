#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')

attribute vec4 a_instanceMatrix_column_0;
attribute vec4 a_instanceMatrix_column_1;
attribute vec4 a_instanceMatrix_column_2;
attribute vec4 a_instanceMatrix_column_3;

attribute float a_treeIndex;
attribute vec3 a_color;

varying float v_treeIndex;
varying vec3 v_normal;
varying vec3 v_color;

varying vec3 vViewPosition;

uniform vec4 testArray;

uniform sampler2D testTexture;

vec4 packFloat(float f) 
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

float unpackFloat4( vec4 _packed)
{
    vec4 rgba = _packed;
    float sign =  step(-128.0, -rgba[1]) * 2.0 - 1.0;
    float exponent = rgba[0] - 127.0;    
    if (abs(exponent + 127.0) < 0.001){
        return 0.0;           
    }

    float mantissa = mod(rgba[1], 128.0) * 65536.0 + rgba[2] * 256.0 + rgba[3] + 8388608.0; //8388608.0 == 0x800000
    return sign *  exp2(exponent-23.0) * mantissa ;     
}

float unpackFloatFromRGBATexel(vec4 texel){
    float byteValueR = floor((texel.r * 255.0) + 0.5);
    float byteValueG = floor((texel.g * 255.0) + 0.5);
    float byteValueB = floor((texel.b * 255.0) + 0.5);
    float byteValueA = floor((texel.a * 255.0) + 0.5);

    return unpackFloat4(vec4(byteValueR, byteValueG, byteValueB, byteValueA));
}

void main()
{
    mat4 instanceMatrix = constructMatrix(
        a_instanceMatrix_column_0,
        a_instanceMatrix_column_1,
        a_instanceMatrix_column_2,
        a_instanceMatrix_column_3
    );

    v_treeIndex = a_treeIndex;
    v_color = a_color;
    v_normal = normalMatrix * normalize(instanceMatrix * vec4(normalize(normal), 0.0)).xyz;

    // vec4 testPack = packFloat(2.5);
    // float testUnpack = unpackFloat4(testPack);
    
    // float testUnpackSource = unpackFloat4(testArray);

    vec4 matrixTexture = texture2D(testTexture, vec2( 1.0 / 32.0 + 0.0 / 16.0 , 0.5));

    float matrixElements[16];

    for(int i = 0; i < 16; i++){
      matrixElements[i] = unpackFloatFromRGBATexel(texture2D(testTexture, vec2( 1.0 / 32.0 + float(i) / 16.0 , 0.5)));
    }

    // if(matrixElements[5] == 1.0){
    //   gl_Position = vec4(0.0);
    //   return;
    // }

    mat4 localTransform = mat4(
      matrixElements[0], matrixElements[1], matrixElements[2], matrixElements[3],
      matrixElements[4], matrixElements[5], matrixElements[6], matrixElements[7],
      matrixElements[8], matrixElements[9], matrixElements[10], matrixElements[11],
      matrixElements[12], matrixElements[13], matrixElements[14], matrixElements[15]
    );


    vec3 transformed = (instanceMatrix * localTransform * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}

//pack a 32bit float into 4 8bit, [0;1] clamped floats
