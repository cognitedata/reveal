uniform vec3 cadLightDirection;
uniform vec3 cadUpDirection;
uniform float cadLightingEnabled;

const vec3 CAD_LIGHT_COLOR = vec3(1.0, 0.98, 0.94);
const vec3 CAD_VIEW_DIRECTION = vec3(0.0, 0.0, 1.0);

vec3 cadFacingNormal(vec3 normal) {
    vec3 N = normalize(normal);
    return N * (2.0 * step(0.0, N.z) - 1.0);
}

float cadWrappedDiffuse(vec3 N, vec3 L) {
    const float wrap = 0.18;
    return max((dot(N, L) + wrap) / (1.0 + wrap), 0.0);
}

vec3 shadeCadColorDefault(vec3 colorRGB, vec3 normal, sampler2D matCapTexture) {
    float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
    vec3 albedo = colorRGB * (0.4 + 0.6 * amplitude);
    vec2 cap = normal.xy * 0.5 + 0.5;
    vec3 mc = texture(matCapTexture, cap).rgb;

    return albedo * mc * 1.7;
}

float shadeCadLumaDefault(vec3 normal) {
    float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
    return 0.4 + 0.6 * amplitude;
}

vec3 shadeCadColor(vec3 colorRGB, vec3 normal, sampler2D matCapTexture) {
    if (cadLightingEnabled < 0.5) {
        return shadeCadColorDefault(colorRGB, normal, matCapTexture);
    }

    vec3 N = cadFacingNormal(normal);
    float ndotl = cadWrappedDiffuse(N, cadLightDirection);
    float hemi = 0.5 + 0.5 * dot(N, cadUpDirection);

    vec3 ambient = colorRGB * mix(0.18, 0.36, hemi);
    vec3 diffuse = colorRGB * CAD_LIGHT_COLOR * ndotl * 0.88;

    vec3 H = normalize(cadLightDirection + CAD_VIEW_DIRECTION);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 32.0) * 0.28;

    vec3 mc = texture(matCapTexture, N.xy * 0.5 + 0.5).rgb;

    return (ambient + diffuse + vec3(spec)) * mix(vec3(1.0), mc, 0.28) * 1.15;
}

float shadeCadLuma(vec3 normal) {
    if (cadLightingEnabled < 0.5) {
        return shadeCadLumaDefault(normal);
    }

    return 0.28 + 0.72 * cadWrappedDiffuse(cadFacingNormal(normal), cadLightDirection);
}
