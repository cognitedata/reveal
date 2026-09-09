uniform sampler2D edgeDepthTexture;
uniform bool edgeSizingEnabled;

#if defined(adaptive_point_size)
float edgeDepthSupport(vec2 uv, float viewDepth, float tolerance) {
    // Viewport borders are not geometry edges.
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
        return 1.0;
    }
    float depth = texture(edgeDepthTexture, uv).r;
    if (depth >= 1.0) {
        return 0.0;
    }
    float ndcDepth = 2.0 * depth - 1.0;
    float neighbourDepth = -(projectionMatrix[3][2] - ndcDepth * projectionMatrix[3][3])
        / (projectionMatrix[2][3] * ndcDepth - projectionMatrix[2][2]);
    return 1.0 - smoothstep(tolerance, 2.0 * tolerance, abs(neighbourDepth - viewDepth));
}

float edgeAwarePointSize(float pointSize, float minSize, vec4 clipPosition, vec4 viewPosition) {
    float smallPointSize = max(minSize, 10.0 * screenHeight * point_size_relative_to_screen_height);
    if (!edgeSizingEnabled || pointSize <= smallPointSize || clipPosition.w <= 0.0) {
        return pointSize;
    }

    vec2 uv = clipPosition.xy / clipPosition.w * 0.5 + 0.5;
    vec2 sampleRadius = vec2(0.75 * pointSize) / vec2(screenWidth, screenHeight);
    float viewDepth = -viewPosition.z;
    float tolerance = 4.0 * pointSize * abs(clipPosition.w) / (screenHeight * abs(projectionMatrix[1][1]));
    vec2 supportGradient = vec2(0.0);
    float support[8];
    const vec2 directions[8] = vec2[8](
        vec2(1.0, 0.0), vec2(0.70710678, 0.70710678),
        vec2(0.0, 1.0), vec2(-0.70710678, 0.70710678),
        vec2(-1.0, 0.0), vec2(-0.70710678, -0.70710678),
        vec2(0.0, -1.0), vec2(0.70710678, -0.70710678)
    );
    for (int i = 0; i < 8; i++) {
        vec2 direction = directions[i];
        support[i] = edgeDepthSupport(uv + direction * sampleRadius, viewDepth, tolerance);
        supportGradient += direction * support[i];
    }

    // One-sided support marks a boundary; two-sided support along only one axis marks a thin railing.
    float edgeStrength = smoothstep(1.5, 2.4, length(supportGradient));
    float lineStrength = 0.0;
    for (int i = 0; i < 4; i++) {
        lineStrength = max(lineStrength, support[i] * support[i + 4]
            * (1.0 - support[(i + 2) % 8]) * (1.0 - support[(i + 6) % 8]));
    }
    if (length(supportGradient) > 0.75 && lineStrength < 1.0 && edgeStrength < 1.0) {
        vec2 along = normalize(supportGradient);
        vec2 across = vec2(-along.y, along.x);
        float continuation = edgeDepthSupport(uv + 2.0 * along * sampleRadius, viewDepth, 2.0 * tolerance);
        float sides = edgeDepthSupport(uv + across * sampleRadius, viewDepth, tolerance)
            + edgeDepthSupport(uv - across * sampleRadius, viewDepth, tolerance);
        // Keep line endings from becoming oversized caps, without shrinking disconnected points.
        lineStrength = max(lineStrength, continuation * (1.0 - clamp(sides, 0.0, 1.0)));
    }
    edgeStrength = max(edgeStrength, 0.7 * lineStrength);
    return mix(pointSize, max(smallPointSize, 0.5 * pointSize), edgeStrength);
}
#endif
