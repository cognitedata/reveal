#pragma glslify: unpackVec4ToFloat = require('../color/unpackVec4ToFloat.glsl')

float unpackFloatFromRGBATexel(vec4 texel){
    float byteValueR = floor((texel.r * 255.0) + 0.5);
    float byteValueG = floor((texel.g * 255.0) + 0.5);
    float byteValueB = floor((texel.b * 255.0) + 0.5);
    float byteValueA = floor((texel.a * 255.0) + 0.5);

    return unpackVec4ToFloat(vec4(byteValueR, byteValueG, byteValueB, byteValueA));
}

mat4 determineMatrixOverride(
  float treeIndex, 
  vec2 treeIndexTextureSize, 
  sampler2D transformOverrideIndexTexture, 
  vec2 transformOverrideTextureSize, 
  sampler2D transformOverrideTexture
) {

    treeIndex = floor(treeIndex + 0.5);
    float dataTextureWidth = treeIndexTextureSize.x;
    float dataTextureHeight = treeIndexTextureSize.y;

    float xTreeIndexTextureCoord = mod(treeIndex, dataTextureWidth);
    float yTreeIndexTextureCoord = floor(treeIndex / dataTextureWidth);

    vec2 indexUV = vec2((xTreeIndexTextureCoord + 0.5) / dataTextureWidth, (yTreeIndexTextureCoord + 0.5) / dataTextureHeight);

    vec3 indexTexel = texture2D(transformOverrideIndexTexture, indexUV).rgb;

    float index = floor(indexTexel.r * 256.0) * 65536.0  + floor(indexTexel.g * 256.0) * 256.0 + floor(indexTexel.b * 256.0);

    if(index == 0.0){
      return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
    }

    float overridesPerRow = transformOverrideTextureSize.x / 16.0;

    float xOverrideTextureCoord = mod(index, overridesPerRow);
    float yOverrideTextureCoord = floor(index / overridesPerRow);

    float cellWidth = 1.0 / transformOverrideTextureSize.x;
    float cellHeight = 1.0 / transformOverrideTextureSize.y;

    float overrideU = (xOverrideTextureCoord / overridesPerRow) + cellWidth / 2.0;
    float overrideV = (yOverrideTextureCoord / transformOverrideTextureSize.y) + cellHeight / 2.0;

    vec2 overrideUV = vec2(overrideU, overrideV); 

    float matrixElements[12];

    for(int i = 0; i < 12; i++){
      matrixElements[i] = unpackFloatFromRGBATexel(texture2D(transformOverrideTexture, overrideUV + vec2(float(i) * cellWidth, 0.0)));
    }
    
    return mat4(
      matrixElements[0], matrixElements[4], matrixElements[8],  0,
      matrixElements[1], matrixElements[5], matrixElements[9],  0,
      matrixElements[2], matrixElements[6], matrixElements[10], 0,
      matrixElements[3], matrixElements[7], matrixElements[11], 1
    );
}

#pragma glslify: export(determineMatrixOverride)