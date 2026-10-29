// Hex tiling: each cell offsets and rotates the texture,
// and the three cells around a pixel blend so the repeat disappears.
// Needs hexGrid.glsl.

// x: rotation, fraction of 180 degrees. y: brightness steers the blend. z: exponent.
uniform vec3 hexTilingParams;
// Above this pixel footprint, one sample is enough.
const float HEX_SINGLE_SAMPLE_FOOTPRINT = 0.25;
// Larger green-channel sample that slowly varies brightness.
const float HEX_MACRO_SCALE = 1.0 / 32.0;
const float HEX_MACRO_STRENGTH = 0.1;
const float HEX_PI = 3.14159265359;
const vec3 HEX_LUMINANCE = vec3(0.299, 0.587, 0.114);

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
