bool isWithinSpan(vec3 point, vec3 span) {
    return all(lessThan(abs(point), span));
}

vec3 transformQuadToCoverScreenInViewSpace(vec3 position, mat4 projectionMatrix, float near) {
    float tanFov = 1.0 / projectionMatrix[1][1];

    float aspect = projectionMatrix[1][1] / projectionMatrix[0][0];
    float maxAspect = max(aspect, 1.0 / aspect);

    vec3 fullScreenQuadCorner = vec3(position.xy * maxAspect * tanFov * near, - near - 1e-6);
    return fullScreenQuadCorner;
}