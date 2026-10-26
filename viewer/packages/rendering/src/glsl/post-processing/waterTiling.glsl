// Water tiling: each cell shifts the texture without rotating it, so waves keep their
// direction. A second, larger copy of the texture is blended in, and every blend keeps
// the contrast of the texture (Heitz and Neyret, 2018), so ripples stay sharp.
// Needs hexGrid.glsl.

// x: blend exponent. y: scale of the second layer. z: strength of the slow brightness change.
uniform vec3 waterTilingParams;
// Between these pixel footprints, the blend fades to one sample.
const float WATER_SINGLE_SAMPLE_FOOTPRINT_START = 0.1;
const float WATER_SINGLE_SAMPLE_FOOTPRINT_END = 0.3;
// Lod high enough to reach the smallest mip, which holds the mean color.
const float WATER_MEAN_LOD = 16.0;
// Keeps the second layer's cells from lining up with the first.
const ivec2 WATER_SECOND_LAYER_CELL_OFFSET = ivec2(37, 91);
const vec2 WATER_SECOND_LAYER_OFFSET = vec2(0.17, 0.43);
// Cells of the brightness noise, in tiles.
const float WATER_MACRO_SCALE = 1.0 / 24.0;
const float WATER_ONE_OVER_SQRT_TWO = 0.70710678;

vec3 waterSampleCell(sampler2D textureMap, vec2 textureCoordinate, vec2 uvDx, vec2 uvDy, ivec2 cell) {
    return textureGrad(textureMap, textureCoordinate + hexHash(cell), uvDx, uvDy).rgb;
}

// Blends the three cells around the coordinate. Dividing the deviations from the mean by
// the length of the weights keeps the variance, so the blend does not look washed out.
vec3 waterBlendCells(sampler2D textureMap, vec2 textureCoordinate, vec2 uvDx, vec2 uvDy, vec3 mean, ivec2 cellOffset) {
    HexNeighborhood neighborhood = hexNeighborhood(textureCoordinate);
    vec3 colorA = waterSampleCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellA + cellOffset);
    vec3 colorB = waterSampleCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellB + cellOffset);
    vec3 colorC = waterSampleCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellC + cellOffset);

    vec3 closeness = vec3(neighborhood.weightA, neighborhood.weightB, neighborhood.weightC);
    vec3 blendWeight = pow(closeness, vec3(waterTilingParams.x));
    blendWeight /= blendWeight.x + blendWeight.y + blendWeight.z;

    vec3 deviation = blendWeight.x * (colorA - mean) + blendWeight.y * (colorB - mean) + blendWeight.z * (colorC - mean);
    return mean + deviation / length(blendWeight);
}

vec3 waterTileSample(sampler2D textureMap, vec2 uv, vec2 uvDx, vec2 uvDy, vec3 mean) {
    float secondScale = waterTilingParams.y;
    vec3 nearLayer = waterBlendCells(textureMap, uv, uvDx, uvDy, mean, ivec2(0));
    vec3 farLayer = waterBlendCells(
        textureMap,
        uv * secondScale + WATER_SECOND_LAYER_OFFSET,
        uvDx * secondScale,
        uvDy * secondScale,
        mean,
        WATER_SECOND_LAYER_CELL_OFFSET
    );
    // Equal mix of the two layers, with the contrast kept.
    return mean + ((nearLayer - mean) + (farLayer - mean)) * WATER_ONE_OVER_SQRT_TWO;
}

vec3 waterTileAlbedo(sampler2D textureMap, vec2 uv) {
    vec2 uvDx = dFdx(uv);
    vec2 uvDy = dFdy(uv);
    float pixelFootprint = max(length(uvDx), length(uvDy));
    vec3 mean = textureLod(textureMap, uv, WATER_MEAN_LOD).rgb;

    vec3 color = waterTileSample(textureMap, uv, uvDx, uvDy, mean);
    // Far away the mips average the texture, so one sample is enough.
    float singleSampleBlend = smoothstep(WATER_SINGLE_SAMPLE_FOOTPRINT_START, WATER_SINGLE_SAMPLE_FOOTPRINT_END, pixelFootprint);
    color = mix(color, textureGrad(textureMap, uv, uvDx, uvDy).rgb, singleSampleBlend);

    float macroStrength = waterTilingParams.z;
    float shade = mix(1.0 - macroStrength, 1.0 + macroStrength, hexValueNoise(uv * WATER_MACRO_SCALE));
    return clamp(color * shade, 0.0, 1.0);
}
