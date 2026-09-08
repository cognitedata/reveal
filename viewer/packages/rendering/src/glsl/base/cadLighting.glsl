// View-space sun and world-up, updated from GeometryPass each CAD draw.
uniform vec3 cadLightDirection;
uniform vec3 cadUpDirection;

const vec3 CAD_LIGHT_COLOR = vec3(1.0, 0.98, 0.94);

vec3 cadFacingNormal(vec3 normal) {
    vec3 N = normalize(normal);
    // Two-sided: shade the side the camera sees (view +Z).
    if (dot(N, vec3(0.0, 0.0, 1.0)) < 0.0) {
        N = -N;
    }
    return N;
}

vec3 cadLightDirectionView() {
    return normalize(cadLightDirection);
}

float cadWrappedDiffuse(vec3 N, vec3 L) {
    const float wrap = 0.18;
    return max((dot(N, L) + wrap) / (1.0 + wrap), 0.0);
}

vec3 shadeCadColor(vec3 colorRGB, vec3 normal, sampler2D matCapTexture) {
    vec3 N = cadFacingNormal(normal);
    vec3 L = cadLightDirectionView();
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 upView = normalize(cadUpDirection);

    float ndotl = cadWrappedDiffuse(N, L);
    float hemi = 0.5 + 0.5 * dot(N, upView);

    vec3 ambient = colorRGB * mix(0.18, 0.36, hemi);
    vec3 diffuse = colorRGB * CAD_LIGHT_COLOR * ndotl * 0.88;

    vec3 H = normalize(L + V);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 32.0) * 0.28;

    vec2 cap = N.xy * 0.5 + 0.5;
    vec3 mc = texture(matCapTexture, cap).rgb;

    // Keep some MatCap so rounded primitives still read as volumes.
    return (ambient + diffuse + vec3(spec)) * mix(vec3(1.0), mc, 0.28) * 1.15;
}

float shadeCadLuma(vec3 normal) {
    vec3 N = cadFacingNormal(normal);
    vec3 L = cadLightDirectionView();
    return 0.28 + 0.72 * cadWrappedDiffuse(N, L);
}
