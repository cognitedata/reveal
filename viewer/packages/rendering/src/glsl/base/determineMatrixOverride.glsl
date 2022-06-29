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

    vec3 indexTexel = texture(transformOverrideIndexTexture, indexUV).rgb;

    float index = floor(indexTexel.r * 256.0) * 65536.0  + floor(indexTexel.g * 256.0) * 256.0 + floor(indexTexel.b * 256.0);
    
    if(index == 0.0){
      return mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
    }

    index = index - 1.0;

    float matrixElements[12];

    for(int i = 0; i < 12; i++){
      matrixElements[i] = texelFetch(transformOverrideTexture, ivec2(i + int(index) * 16, 0.0), 0).r;
    }
    
    return mat4(
      matrixElements[0], matrixElements[4], matrixElements[8],  0,
      matrixElements[1], matrixElements[5], matrixElements[9],  0,
      matrixElements[2], matrixElements[6], matrixElements[10], 0,
      matrixElements[3], matrixElements[7], matrixElements[11], 1
    );
}
