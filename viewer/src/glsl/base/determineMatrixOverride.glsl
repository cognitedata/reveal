#pragma glslify: unpackVec4ToFloat = require('../color/unpackVec4ToFloat.glsl')

float unpackFloatFromRGBATexel(vec4 texel){
    float byteValueR = floor((texel.r * 255.0) + 0.5);
    float byteValueG = floor((texel.g * 255.0) + 0.5);
    float byteValueB = floor((texel.b * 255.0) + 0.5);
    float byteValueA = floor((texel.a * 255.0) + 0.5);

    return unpackVec4ToFloat(vec4(byteValueR, byteValueG, byteValueB, byteValueA));
}

mat4 determineMatrixOverride(float treeIndex, float dataTextureWidth, float dataTextureHeight, sampler2D matrixTransformTexture){
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
    
    return mat4(
      matrixElements[0], matrixElements[4], matrixElements[8],  0,
      matrixElements[1], matrixElements[5], matrixElements[9],  0,
      matrixElements[2], matrixElements[6], matrixElements[10], 0,
      matrixElements[3], matrixElements[7], matrixElements[11], 1
    );
}

#pragma glslify: export(determineMatrixOverride)