// Hex tiling: each cell offsets and rotates the texture,
// and the three cells around a pixel blend so the repeat disappears.

// x: rotation, fraction of 180 degrees. y: brightness steers the blend. z: exponent.
uniform vec3 hexTilingParams;
// Above this pixel footprint, one sample is enough.
const float HEX_SINGLE_SAMPLE_FOOTPRINT = 0.25;
// Larger green-channel sample that slowly varies brightness.
const float HEX_MACRO_SCALE = 1.0 / 32.0;
const float HEX_MACRO_STRENGTH = 0.1;
const float HEX_PI = 3.14159265359;
const vec3 HEX_LUMINANCE = vec3(0.299, 0.587, 0.114);
const float HEX_ONE_OVER_SQRT_THREE = 0.57735027;
const float HEX_TWO_OVER_SQRT_THREE = 1.15470054;
const mat2 HEX_TO_SKEWED_GRID = mat2(1.0, 0.0, -HEX_ONE_OVER_SQRT_THREE, HEX_TWO_OVER_SQRT_THREE);
const mat2 HEX_FROM_SKEWED_GRID = mat2(1.0, 0.0, 0.5, 1.0 / HEX_TWO_OVER_SQRT_THREE);
const uint HEX_HASH_MULTIPLIER = 1664525u;
const uint HEX_HASH_Y_MULTIPLIER = 1013904223u;
const float HEX_HASH_TO_UNIT = 1.0 / 4294967296.0;

struct HexNeighborhood {
    float weightA;
    float weightB;
    float weightC;
    ivec2 cellA;
    ivec2 cellB;
    ivec2 cellC;
};

uvec2 hexMixHash(uvec2 value) {
    value.x += value.y * HEX_HASH_MULTIPLIER;
    value.y += value.x * HEX_HASH_MULTIPLIER;
    value ^= value >> 16u;
    return value;
}

vec2 hexHash(ivec2 cell) {
    uvec2 mixed = uvec2(cell) * uvec2(HEX_HASH_MULTIPLIER, HEX_HASH_Y_MULTIPLIER);
    mixed = hexMixHash(mixed);
    mixed = hexMixHash(mixed);
    return vec2(mixed) * HEX_HASH_TO_UNIT;
}

float hexGridScale() {
    return 2.0 * sqrt(3.0);
}

HexNeighborhood hexNeighborhood(vec2 textureCoordinate) {
    vec2 skewed = HEX_TO_SKEWED_GRID * (textureCoordinate * hexGridScale());
    ivec2 baseCell = ivec2(floor(skewed));
    vec3 barycentric = vec3(fract(skewed), 0.0);
    barycentric.z = 1.0 - barycentric.x - barycentric.y;

    float inOppositeTriangle = step(0.0, -barycentric.z);
    float triangleSign = 2.0 * inOppositeTriangle - 1.0;
    int opposite = int(inOppositeTriangle);

    HexNeighborhood neighborhood;
    neighborhood.weightA = -barycentric.z * triangleSign;
    neighborhood.weightB = inOppositeTriangle - barycentric.y * triangleSign;
    neighborhood.weightC = inOppositeTriangle - barycentric.x * triangleSign;
    neighborhood.cellA = baseCell + ivec2(opposite, opposite);
    neighborhood.cellB = baseCell + ivec2(opposite, 1 - opposite);
    neighborhood.cellC = baseCell + ivec2(1 - opposite, opposite);
    return neighborhood;
}

vec2 hexCellCenter(ivec2 cell) {
    return (HEX_FROM_SKEWED_GRID * vec2(cell)) / hexGridScale();
}

mat2 hexCellRotation(ivec2 cell) {
    float rotationStrength = hexTilingParams.x;
    float rawAngle = float(abs(cell.x * cell.y) + abs(cell.x + cell.y)) + HEX_PI;
    float angle = mod(rawAngle, 2.0 * HEX_PI);
    if (angle > HEX_PI) angle -= 2.0 * HEX_PI;
    angle *= rotationStrength;

    float cosine = cos(angle);
    float sine = sin(angle);
    return mat2(cosine, sine, -sine, cosine);
}

vec3 sampleHexCell(sampler2D textureMap, vec2 textureCoordinate, vec2 uvDx, vec2 uvDy, ivec2 cell) {
    mat2 rotation = hexCellRotation(cell);
    vec2 center = hexCellCenter(cell);
    vec2 shifted = rotation * (textureCoordinate - center) + center + hexHash(cell);

    // Mip level comes from the original uv. The sampler wraps the shifted coordinate.
    return textureGrad(textureMap, shifted, rotation * uvDx, rotation * uvDy).rgb;
}

vec3 hexTileSample(sampler2D textureMap, vec2 textureCoordinate, vec2 uvDx, vec2 uvDy) {
    HexNeighborhood neighborhood = hexNeighborhood(textureCoordinate);
    vec3 colorA = sampleHexCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellA);
    vec3 colorB = sampleHexCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellB);
    vec3 colorC = sampleHexCell(textureMap, textureCoordinate, uvDx, uvDy, neighborhood.cellC);

    float luminanceFalloff = hexTilingParams.y;
    float blendExponent = hexTilingParams.z;
    vec3 sampleLuminance = vec3(
        dot(colorA, HEX_LUMINANCE),
        dot(colorB, HEX_LUMINANCE),
        dot(colorC, HEX_LUMINANCE)
    );

    // Brighter samples take more of the blend, so the seam follows the texture.
    vec3 blendWeight = mix(vec3(1.0), sampleLuminance, luminanceFalloff);
    vec3 closeness = vec3(neighborhood.weightA, neighborhood.weightB, neighborhood.weightC);
    blendWeight *= pow(closeness, vec3(blendExponent));
    blendWeight /= blendWeight.x + blendWeight.y + blendWeight.z;
    return blendWeight.x * colorA + blendWeight.y * colorB + blendWeight.z * colorC;
}

vec3 hexTileAlbedo(sampler2D textureMap, vec2 uv) {
    vec2 uvDx = dFdx(uv);
    vec2 uvDy = dFdy(uv);
    float pixelFootprint = max(length(uvDx), length(uvDy));

    vec3 color = pixelFootprint > HEX_SINGLE_SAMPLE_FOOTPRINT
        ? texture(textureMap, uv).rgb
        : hexTileSample(textureMap, uv, uvDx, uvDy);

    float largeScaleBrightness = texture(textureMap, uv * HEX_MACRO_SCALE).g;
    float shade = mix(1.0 - HEX_MACRO_STRENGTH, 1.0 + HEX_MACRO_STRENGTH, largeScaleBrightness);
    return color * shade;
}
