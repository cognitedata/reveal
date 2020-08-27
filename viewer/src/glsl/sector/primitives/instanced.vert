#pragma glslify: constructMatrix = require('../../base/constructMatrix.glsl')
#pragma glslify: unpackVec4ToFloat = require('../../color/unpackVec4ToFloat.glsl')

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

uniform vec2 dataTextureSize;

uniform sampler2D matrixTransformTexture;

float unpackFloatFromRGBATexel(vec4 texel){
    float byteValueR = floor((texel.r * 255.0) + 0.5);
    float byteValueG = floor((texel.g * 255.0) + 0.5);
    float byteValueB = floor((texel.b * 255.0) + 0.5);
    float byteValueA = floor((texel.a * 255.0) + 0.5);

    return unpackVec4ToFloat(vec4(byteValueR, byteValueG, byteValueB, byteValueA));
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

    float treeIndex = floor(a_treeIndex + 0.5);
    float dataTextureWidth = dataTextureSize.x;
    float dataTextureHeight = dataTextureSize.y;

    float cellWidth = 1.0 / (dataTextureWidth * 16.0);
    float cellHeight = 1.0 / dataTextureHeight;

    float xTreeIndexCoord = mod(treeIndex, dataTextureWidth);
    float yTreeIndexCoord = floor(treeIndex / dataTextureWidth);
    float uCoord = (xTreeIndexCoord * (cellWidth * 16.0)) + (cellWidth / 2.0);
    float vCoord = (yTreeIndexCoord * cellHeight) + (cellHeight / 2.0);
    vec2 treeIndexUv = vec2(uCoord, vCoord);

    float matrixElements[12];

    for(int i = 0; i < 12; i++){
      matrixElements[i] = unpackFloatFromRGBATexel(texture2D(matrixTransformTexture, treeIndexUv + vec2(float(i) * cellWidth, 0.0)));

    }
    
    mat4 localTransform = mat4(
      matrixElements[0], matrixElements[4], matrixElements[8],  0,
      matrixElements[1], matrixElements[5], matrixElements[9],  0,
      matrixElements[2], matrixElements[6], matrixElements[10], 0,
      matrixElements[3], matrixElements[7], matrixElements[11], 1
    );

    vec3 transformed = (instanceMatrix * localTransform * vec4(position, 1.0)).xyz;
    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPosition = modelViewPosition.xyz;
    gl_Position = projectionMatrix * modelViewPosition;
}