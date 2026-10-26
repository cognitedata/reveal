// Hex grid shared by the texture variation techniques. Each texture coordinate falls in
// a triangle of three cells; the barycentric weights say how close the three cells are.

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

// Smooth value noise on the hex hash. Used for slow brightness changes.
float hexValueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    ivec2 base = ivec2(cell);
    float bottomLeft = hexHash(base).x;
    float bottomRight = hexHash(base + ivec2(1, 0)).x;
    float topLeft = hexHash(base + ivec2(0, 1)).x;
    float topRight = hexHash(base + ivec2(1, 1)).x;
    return mix(mix(bottomLeft, bottomRight, blend.x), mix(topLeft, topRight, blend.x), blend.y);
}
