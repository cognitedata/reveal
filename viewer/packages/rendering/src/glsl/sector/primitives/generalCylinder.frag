precision highp float;

#pragma glslify: import('../../base/nodeAppearance.glsl')
#pragma glslify: import('../../base/updateFragmentColor.glsl')
#pragma glslify: import('../../base/determineNodeAppearance.glsl');
#pragma glslify: import('../../base/determineColor.glsl');
#pragma glslify: import('../../base/isClipped.glsl');
#pragma glslify: import('../../treeIndex/treeIndexPacking.glsl');
#pragma glslify: import('../../math/constants.glsl')

// TODO general cylinder and cone are very similar and used
// the same shader in the old code. Consider de-duplicating
// parts of this code

uniform sampler2D colorDataTexture;
uniform sampler2D matCapTexture;
uniform vec2 treeIndexTextureSize;
uniform mat4 projectionMatrix;
uniform lowp int renderMode;

// Note! Must be placed after all uniforms in order for this to work on iOS (REV-287)
#pragma glslify: import('../../base/updateFragmentDepth.glsl')

in highp vec2  v_treeIndexPacked;
in vec3 v_color;

in vec3 v_viewPos;

in mat3 v_modelBasis;

in vec3 v_centerB;

in vec2 v_angles;

in vec4 v_planeA;
in vec4 v_planeB;

in float v_radius;

void main()
{
    highp float v_treeIndex = unpackTreeIndex(v_treeIndexPacked);

    // Redo appearance texture lookup from vertex shader due to limit in transferable attributes
    NodeAppearance appearance = determineNodeAppearance(colorDataTexture, treeIndexTextureSize, v_treeIndex);

    vec4 color = determineColor(v_color, appearance);

    vec3 rayTarget = v_viewPos;
    vec3 rayDirection = normalize(rayTarget); // rayOrigin is (0,0,0) in camera space
    float rayTargetDist = length(rayTarget);

    vec3 diff = rayTarget - v_centerB;
    vec3 E = diff * v_modelBasis;
    vec3 D = rayDirection * v_modelBasis;

    float a = dot(D.xy, D.xy);
    float b = dot(E.xy, D.xy);
    float c = dot(E.xy, E.xy) - v_radius*v_radius;

    // Calculate a discriminant of the above quadratic equation
    float d = b*b - a*c;

    // d < 0.0 means the ray hits outside an infinitely long cone
    if (d < 0.0) discard;

    float sqrtd = sqrt(d);
    float dist1 = (-b - sqrtd) / a;
    float dist2 = (-b + sqrtd) / a;

    float dist = min(dist1, dist2);
    vec3 intersectionPoint = E + dist * D;

    float theta = atan(intersectionPoint.y, intersectionPoint.x);

    // Add a full arc to theta until it's larger than the base angle (a maximum of two iterations needed)
    theta += theta < v_angles[0] ? 2.0 * PI : 0.0;
    theta += theta < v_angles[0] ? 2.0 * PI : 0.0;

    // Intersection point in camera space
    vec3 p = rayTarget + dist * rayDirection;

    vec3 planeACenter = vec3(0.0, 0.0, v_planeA.w);
    vec3 planeANormal = v_planeA.xyz;
    vec3 planeBCenter = vec3(0.0, 0.0, v_planeB.w);
    vec3 planeBNormal = v_planeB.xyz;

    float normalFactor = 1.0;

    if (dot(intersectionPoint - planeACenter, planeANormal) > 0.0 ||
        dot(intersectionPoint - planeBCenter, planeBNormal) > 0.0 ||
        theta > v_angles[1] + v_angles[0] ||
        isClipped(p) ||
        rayTargetDist + dist < 0.0
       ) {
        // Missed the first point, check the other point
        dist = max(dist1, dist2);
        intersectionPoint = E + dist * D;
        theta = atan(intersectionPoint.y, intersectionPoint.x);
        theta += theta < 0.0 ? 2.0 * PI : 0.0;
        theta += theta < v_angles[0] ? 2.0 * PI : 0.0;
        p = rayTarget + dist*rayDirection;
        if (dot(intersectionPoint - planeACenter, planeANormal) > 0.0 ||
            dot(intersectionPoint - planeBCenter, planeBNormal) > 0.0 ||
            theta > v_angles[1] + v_angles[0] || isClipped(p) ||
            rayTargetDist + dist < 0.0
           ) {
            // Missed the other point too
            discard;
        }
        normalFactor = -1.0;
    }

    vec3 p_local = p - v_centerB;
    vec3 normal = normalize(p_local - v_modelBasis[2] * dot(p_local, v_modelBasis[2])) * normalFactor;

    float fragDepth = updateFragmentDepth(p, projectionMatrix);
    updateFragmentColor(renderMode, color, v_treeIndex, normal, fragDepth, matCapTexture, GeometryType.Primitive);
}
